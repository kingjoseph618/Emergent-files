# GitHub Copilot Instructions for Emergent-files

## Project Overview
Emergent-files is a personal portfolio website combined with a Free Local Bot Emulator—a Windows-based AI task automation tool powered by Ollama that runs locally without requiring API keys.

## Project Structure

### Root Level
- `index.html`, `about-us.html`, `contact.html`, `resources.html`, `services.html`, `get-help.html` — Portfolio website pages
- `kingsman_status.txt` — Project status tracker

### Free-Local-Task-Bot-FIXED/
The core bot application directory:
- `server.py` — Python backend handling Ollama integration and agent logic
- `app.js` — Frontend UI controller for the chat interface
- `index.html` — Chat interface markup
- `styles.css` — Application styling
- `start.bat` — Windows startup script that launches the bot
- `agent-workspace/` — Sandbox directory where the bot creates/reads/modifies files

### edna-core/
Configuration and manifest directory (under development):
- `edna_master_manifest.json` — Master configuration (currently empty)
- Custom agent specifications and instructions

## Coding Conventions

### Python (server.py)
- Use standard library only (no external dependencies for portability)
- Implement tool execution with sandbox safety checks (see `safe_path()` method)
- Follow PEP 8 style guidelines
- All file operations must be restricted to `agent-workspace/` directory
- Use `ThreadingHTTPServer` for concurrent request handling

### JavaScript (app.js)
- Vanilla JavaScript, no frameworks
- Use DOM query selectors with the `$()` helper function
- Handle async/await for API calls
- Implement proper error handling with user-friendly messages
- Keep UI state in the `messages` array

### HTML/CSS
- Semantic HTML structure
- CSS Grid or Flexbox for layouts
- Mobile-responsive design
- Accessibility considerations (ARIA labels, semantic elements)

## Building and Running

### Prerequisites
- Python 3.8+ installed
- Ollama installed from https://ollama.com/download/windows (Windows only)
- Git

### Quick Start
1. Navigate to `Free-Local-Task-Bot-FIXED/`
2. Run `start.bat` (Windows)
3. First run automatically downloads `llama3.2:3b` model
4. Open http://127.0.0.1:8844 in browser
5. Press Ctrl+C in command window to stop

### Configuration
Environment variables (optional):
- `BOT_EMULATOR_PORT` — Port number (default: 8844)
- `OLLAMA_URL` — Ollama API endpoint (default: http://127.0.0.1:11434/api/chat)
- `OLLAMA_MODEL` — Model to use (default: llama3.2:3b)

## Bot Capabilities

The bot has four core tools available to agents:
1. **list_files** — List files in agent-workspace
2. **read_file** — Read UTF-8 text files (max 100KB)
3. **write_file** — Create or replace files
4. **run_command** — Execute PowerShell commands (max 120s timeout)

All operations are sandboxed to `agent-workspace/` directory for security.

## Key Files and Their Roles

- `server.py`: HTTP server, Ollama communication, tool execution
- `app.js`: User input handling, message display, API communication
- `TOOLS` array in `server.py`: Defines agent capabilities
- `OLLAMA_URL`: API endpoint for local model inference

## Contributing Guidelines

- Keep changes isolated to their respective directories
- Maintain backward compatibility with Ollama API
- Test locally before committing
- Update this file if you add new features or change conventions
- Ensure sandboxing constraints are never relaxed

## Topics and Focus Areas
- Cartoon/animation (personal interests)
- Mental health, therapy, redemption (thematic elements)
- Loyalty, honor, marriage (values)
- Music, on-the-spot improvisation (skills)
