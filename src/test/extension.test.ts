import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/* lines and columns are 0 indexed */

suite('Extension Test Suite', function() {
	this.timeout(1000_000);
	let workspaceFolder: vscode.WorkspaceFolder;
	let testFilePath: string;
	let editor: vscode.TextEditor;

	suiteSetup(async () => {
		const tempDir = path.join(os.tmpdir(), `vscode-test-workspace`);
		// Ensure the directory exists and is empty
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
		fs.mkdirSync(tempDir, { recursive: true });

		// Create a workspace folder
		workspaceFolder = {
			uri: vscode.Uri.file(tempDir),
			name: 'test-workspace',
			index: 0
		};

		// Set the workspace folders
		vscode.workspace.updateWorkspaceFolders(0, vscode.workspace.workspaceFolders?.length || 0, workspaceFolder);

		// Create test.js file path
		testFilePath = path.join(workspaceFolder.uri.fsPath, 'test.js');

		// Create a complex test file with nested curly braces in various contexts
		const testContent = `// This is a comment with {curly braces} that should be ignored
function test() {
    // Another comment with {curly braces} that should be ignored
    const str1 = 'String with {curly braces} that should be ignored';
    const str2 = "String with {curly braces} that should be ignored";
    const str3 = \`String with {curly braces} that should be ignored\`;

    if (true) {
        console.log('test');
        if (true) {
            // Deeply nested comment with {curly braces}
            const x = {
                a: {
                    b: {
                        c: 'test'
                    }
                }
            };
        }
    }
}`;

		// Write the test file
		fs.writeFileSync(testFilePath, testContent);

		// Open the file
		const document = await vscode.workspace.openTextDocument(testFilePath);
		await vscode.window.showTextDocument(document);

		// Get the editor
		editor = vscode.window.activeTextEditor!;
		assert.ok(editor, 'No active editor found');
	});

	test('Should not go to curly braces in strings', async () => {
		editor.selection = new vscode.Selection(3, 36, 3, 36);
		await vscode.commands.executeCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockStart');
		assert.strictEqual(editor.selection.active.line, 1, 'Should go to line 1');
		assert.strictEqual(editor.selection.active.character, 17, 'Should go to character 17');

		editor.selection = new vscode.Selection(4, 36, 4, 36);
		await vscode.commands.executeCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockStart');
		assert.strictEqual(editor.selection.active.line, 1, 'Should go to line 1');
		assert.strictEqual(editor.selection.active.character, 17, 'Should go to character 17');

		editor.selection = new vscode.Selection(5, 36, 5, 36);
		await vscode.commands.executeCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockStart');
		assert.strictEqual(editor.selection.active.line, 1, 'Should go to line 1');
		assert.strictEqual(editor.selection.active.character, 17, 'Should go to character 17');
	});

	test('Should not go to curly braces in comments', async () => {
		editor.selection = new vscode.Selection(2, 35, 2, 35);
		await vscode.commands.executeCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockStart');
		assert.strictEqual(editor.selection.active.line, 1, 'Should go to line 1');
		assert.strictEqual(editor.selection.active.character, 17, 'Should go to character 17');
	});

	test('Should go from nested position to top level curly brace', async () => {
		editor.selection = new vscode.Selection(14, 33, 14, 33);
		for (let i = 0; i < 6; i++) {
			await vscode.commands.executeCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockStart');
		}
		assert.strictEqual(editor.selection.active.line, 1, 'Should go to line 1');
		assert.strictEqual(editor.selection.active.character, 17, 'Should go to character 17');
	});

	test('Should go from nested position to bottom level curly brace', async () => {
		editor.selection = new vscode.Selection(14, 33, 14, 33);
		for (let i = 0; i < 6; i++) {
			await vscode.commands.executeCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockEnd');
		}
		assert.strictEqual(editor.selection.active.line, 20, 'Should go to line 20');
		assert.strictEqual(editor.selection.active.character, 0, 'Should go to character 0');
	});
	
	test('if no curly braces are found, do nothing', async () => {
		editor.selection = new vscode.Selection(1, 5, 1, 5);
		await vscode.commands.executeCommand('jetbrains-move-caret-to-code-block-keybinding.moveToBlockStart');
		assert.strictEqual(editor.selection.active.line, 1, 'Should not move');
		assert.strictEqual(editor.selection.active.character, 5, 'Should not move');
	});
});
