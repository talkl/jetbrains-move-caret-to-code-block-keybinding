import * as vscode from 'vscode';

// Helper function to check if a character is inside a string
function isInsideString(line: string, charIndex: number): boolean {
    let inString = false;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escapeNext = false;

    for (let i = 0; i <= charIndex; i++) {
        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        const char = line[i];
        if (char === '\\') {
            escapeNext = true;
        } else if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            inString = inDoubleQuote;
        } else if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            inString = inSingleQuote;
        }
    }
    return inString;
}

// Helper function to check if a character is inside a comment
function isInsideComment(line: string, charIndex: number): boolean {
    let inSingleLineComment = false;
    let inMultiLineComment = false;
    let i = 0;

    while (i <= charIndex) {
        if (line[i] === '/' && line[i + 1] === '/') {
            inSingleLineComment = true;
            break;
        }
        if (line[i] === '/' && line[i + 1] === '*') {
            inMultiLineComment = true;
            break;
        }
        if (line[i] === '*' && line[i + 1] === '/') {
            inMultiLineComment = false;
            i += 2;
            continue;
        }
        i++;
    }
    return inSingleLineComment || inMultiLineComment;
}

export function activate(context: vscode.ExtensionContext) {
    let lastBlockStart: vscode.Position | null = null;
    let lastBlockEnd: vscode.Position | null = null;

    const disposable = vscode.commands.registerCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockEnd', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;
        
        let currentLine = position.line;
        let bracketCount = 1;
        let foundClosingBracket = false;

        // If we're already at a block end, find the parent block
        if (lastBlockEnd && position.isEqual(lastBlockEnd)) {
            bracketCount = 2; // Start looking for the parent block
        }

        // Find the matching closing bracket
        while (currentLine < document.lineCount) {
            const line = document.lineAt(currentLine).text;
            for (let i = currentLine === position.line ? position.character : 0; i < line.length; i++) {
                if (!isInsideString(line, i) && !isInsideComment(line, i)) {
                    if (line[i] === '{') {
                        bracketCount++;
                    } else if (line[i] === '}') {
                        bracketCount--;
                        if (bracketCount === 0) {
                            foundClosingBracket = true;
                            const newPosition = position.with(currentLine, i);
                            lastBlockEnd = newPosition;
                            editor.selections = [new vscode.Selection(newPosition, newPosition)];
                            editor.revealRange(new vscode.Range(newPosition, newPosition));
                            return;
                        }
                    }
                }
            }
            currentLine++;
        }
    });

    const disposable2 = vscode.commands.registerCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockStart', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;
        
        let currentLine = position.line;
        let bracketCount = 1;
        let foundOpeningBracket = false;

        // If we're already at a block start, find the parent block
        if (lastBlockStart && position.isEqual(lastBlockStart)) {
            bracketCount = 2; // Start looking for the parent block
        }

        // Search backwards for the opening bracket
        while (currentLine >= 0) {
            const line = document.lineAt(currentLine).text;
            
            // Start looking from position.character - 1 if on the same line,
            // so if we're just before a '}', it won't count this bracket.
            const startChar = (currentLine === position.line)
                ? position.character - 1
                : line.length - 1;

            for (let i = startChar; i >= 0; i--) {
                if (!isInsideString(line, i) && !isInsideComment(line, i)) {
                    if (line[i] === '}') {
                        bracketCount++;
                    } else if (line[i] === '{') {
                        bracketCount--;
                        if (bracketCount === 0) {
                            // Place the caret after the '{' instead of before it
                            const newPosition = new vscode.Position(currentLine, i + 1);
                            lastBlockStart = newPosition;
                            editor.selections = [new vscode.Selection(newPosition, newPosition)];
                            editor.revealRange(new vscode.Range(newPosition, newPosition));
                            return;
                        }
                    }
                }
            }
            currentLine--;
        }
    });

    context.subscriptions.push(disposable, disposable2);
}

export function deactivate() {} 