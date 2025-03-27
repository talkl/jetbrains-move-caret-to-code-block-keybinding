# JetBrains Move Caret to Code Block Keybinding

This extension provides a key shortcut to navigate between start and end of code blocks just like JetBrains IDEs Move Caret to Code Block Start / End.

## Features

- Move to end of code block (Ctrl+Alt+] / Cmd+Alt+])
- Move to start of code block (Ctrl+Alt+[ / Cmd+Alt+[)

## Supported Languages

- Java
- C#
- C++
- JavaScript/TypeScript
- Python (with curly braces)
- PHP
- Ruby (with curly braces)
- Go
- Rust
- Swift
- Kotlin
- Scala

## Demo

[Demo GIF will be added here]

## How it Works

This extension uses intelligent bracket matching to identify code blocks. It:

- Counts opening and closing curly braces to find matching blocks
- Handles nested blocks by tracking bracket depth
- Ignores brackets that appear inside strings or comments
- Supports finding parent blocks when already at a block boundary
- Works with any language that uses curly braces for code blocks

## Requirements

- VS Code 1.74 or higher