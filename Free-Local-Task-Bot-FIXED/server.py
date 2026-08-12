import json
import mimetypes
import os
import subprocess
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = int(os.environ.get("BOT_EMULATOR_PORT", "8844"))
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
TASK_ROOT = ROOT / "agent-workspace"
TASK_ROOT.mkdir(exist_ok=True)
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "list_files",
            "description": "List files in the agent workspace.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read a UTF-8 text file from the agent workspace.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Create or replace a UTF-8 text file in the agent workspace.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": ["path", "content"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": "Run a PowerShell command in the agent workspace. Requires user approval.",
            "parameters": {
                "type": "object",
                "properties": {"command": {"type": "string"}},
                "required": ["command"],
            },
        },
    },
]


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        relative = path.split("?", 1)[0].split("#", 1)[0].lstrip("/")
        return str(ROOT / (relative or "index.html"))

    def do_GET(self):
        if self.path == "/api/health":
            self.send_json({"ok": True, "model": DEFAULT_MODEL})
            return
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/chat":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
            messages = payload.get("messages", [])
            model = payload.get("model") or DEFAULT_MODEL
            system_prompt = payload.get("system", "You are a helpful local assistant.")
            agent_prompt = (
                system_prompt
                + "\nYou are also a local task agent. Use tools when a request requires files "
                "or command execution. Work only inside the agent workspace. Explain the result."
            )
            ollama_messages = [{"role": "system", "content": agent_prompt}]
            ollama_messages.extend(
                m for m in messages
                if m.get("role") in {"user", "assistant"} and m.get("content")
            )
            self.run_agent(model, ollama_messages)
        except urllib.error.URLError:
            self.send_json({
                "error": (
                    "Ollama is not reachable. Install Ollama, run "
                    f"'ollama pull {DEFAULT_MODEL}', then restart this emulator."
                )
            }, status=503)
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=500)

    def ollama_chat(self, model, messages):
        body = json.dumps({
            "model": model,
            "messages": messages,
            "tools": TOOLS,
            "stream": False,
        }).encode("utf-8")
        request = urllib.request.Request(
            OLLAMA_URL,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=300) as response:
            return json.loads(response.read())

    def run_agent(self, model, messages):
        for _ in range(8):
            result = self.ollama_chat(model, messages)
            message = result.get("message", {})
            tool_calls = message.get("tool_calls") or []
            if not tool_calls:
                self.send_json({"reply": message.get("content", ""), "model": model})
                return

            messages.append(message)
            for call in tool_calls:
                function = call.get("function", {})
                name = function.get("name", "")
                arguments = function.get("arguments", {})
                if isinstance(arguments, str):
                    arguments = json.loads(arguments or "{}")
                output = self.execute_tool(name, arguments)
                messages.append({"role": "tool", "content": output})
        self.send_json({"reply": "Stopped after eight tool steps. Please continue the task.", "model": model})

    def safe_path(self, relative):
        candidate = (TASK_ROOT / (relative or ".")).resolve()
        if candidate != TASK_ROOT and TASK_ROOT not in candidate.parents:
            raise ValueError("Path must stay inside the agent workspace.")
        return candidate

    def execute_tool(self, name, arguments):
        try:
            if name == "list_files":
                target = self.safe_path(arguments.get("path", "."))
                if not target.exists():
                    return "Path does not exist."
                return "\n".join(str(p.relative_to(TASK_ROOT)) for p in target.iterdir()) or "Workspace is empty."
            if name == "read_file":
                return self.safe_path(arguments["path"]).read_text(encoding="utf-8")[:100000]
            if name == "write_file":
                target = self.safe_path(arguments["path"])
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(arguments["content"], encoding="utf-8")
                return f"Wrote {target.relative_to(TASK_ROOT)}."
            if name == "run_command":
                completed = subprocess.run(
                    ["powershell", "-NoProfile", "-Command", arguments["command"]],
                    cwd=TASK_ROOT,
                    capture_output=True,
                    text=True,
                    timeout=120,
                )
                output = (completed.stdout + completed.stderr).strip()
                return f"Exit code: {completed.returncode}\n{output}"[:100000]
            return f"Unknown tool: {name}"
        except Exception as exc:
            return f"Tool error: {exc}"

    def send_json(self, payload, status=200):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"[bot-emulator] {fmt % args}")


if __name__ == "__main__":
    mimetypes.add_type("text/javascript", ".js")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Free Local Bot Emulator: http://{HOST}:{PORT}")
    print(f"Model: {DEFAULT_MODEL} via Ollama")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
