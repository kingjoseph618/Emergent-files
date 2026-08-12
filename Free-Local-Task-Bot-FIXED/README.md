# Free Local Bot Emulator

This bot runs on your Windows computer using a free local Ollama model. It does not require an OpenAI API key or paid API usage.

It can list, read, and create files inside `agent-workspace`. It can also run PowerShell commands automatically inside that workspace.

## Start it

1. Install Ollama from <https://ollama.com/download/windows>.
2. Double-click `start.bat`.
3. Double-click `start.bat`. The first run downloads `llama3.2:3b` and opens the emulator at <http://127.0.0.1:8844>.

Keep the command window open while using the emulator. Press `Ctrl+C` in that window to stop it.

## Execute a task

Ask for a concrete result, such as: `Create a simple expense tracker webpage in the agent workspace.` The bot creates the files and runs the needed task steps automatically.

## Use it in multiple places

Copy this complete folder to another Windows computer and run `start.bat`. Ollama and Python must be installed on that computer.

The interface can also be hosted on a website, but automatic computer-task execution requires the `server.py` backend and Ollama to run on a computer or server. A static website alone cannot execute operating-system tasks.

## Customize it

Use the left panel to change the bot name, model, and instructions. Conversation data is kept only in the active browser page and is cleared when the page closes or you select **Clear conversation**.
