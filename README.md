# JetBrains Move Caret to Code Block Keybinding

This extension provides a key shortcut to navigate between start and end of code blocks just like JetBrains IDEs Move Caret to Code Block Start / End.

## Features

- Move to end of code block (Ctrl+Alt+] / Cmd+Alt+])
- Move to start of code block (Ctrl+Alt+[ / Cmd+Alt+[)

## Supported Languages

- JavaScript/TypeScript (tested and verified)
- Other languages may work but are not officially tested yet
- More language support coming soon!

## Demo

[Demo GIF will be added here]

## How it Works

This extension uses intelligent bracket matching to identify code blocks. It:

- Counts opening and closing curly braces to find matching blocks
- Handles nested blocks by tracking bracket depth
- Ignores brackets that appear inside strings or comments
- Supports finding parent blocks when already at a block boundary

## Requirements

- VS Code 1.74 or higher