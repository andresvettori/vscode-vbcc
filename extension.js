const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Create output channel for VBCC
    const outputChannel = vscode.window.createOutputChannel('VBCC');

    // Register compile command
    let compileDisposable = vscode.commands.registerCommand('vscode-vbcc.compile', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'c') {
            vscode.window.showErrorMessage('Active file is not a C source file');
            return;
        }

        // Save the file before compiling
        await document.save();

        const filePath = document.fileName;
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath, '.c');
        const outputFile = path.join(fileDir, `${fileName}.tos`);

        // Clear output channel
        outputChannel.clear();
        outputChannel.show();

        // Compile using VBCC
        const compileCommand = `vc +tos ${filePath} -o ${outputFile}`;
        
        exec(compileCommand, { cwd: fileDir }, (error, stdout, stderr) => {
            if (error) {
                outputChannel.appendLine(`Compilation failed: ${error.message}`);
                outputChannel.appendLine(stderr);
                vscode.window.showErrorMessage('Compilation failed. Check output for details.');
                return;
            }

            if (stdout) outputChannel.appendLine(stdout);
            if (stderr) outputChannel.appendLine(stderr);

            vscode.window.showInformationMessage('Compilation successful');
        });
    });

    // Register run command
    let runDisposable = vscode.commands.registerCommand('vscode-vbcc.run', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const filePath = editor.document.fileName;
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath, '.c');
        const tosFile = path.join(fileDir, `${fileName}.tos`);

        if (!fs.existsSync(tosFile)) {
            vscode.window.showErrorMessage('Compiled .tos file not found. Please compile first.');
            return;
        }

        // Run using Hatari
        const runCommand = `hatari "${tosFile}"`;
        
        exec(runCommand, { cwd: fileDir }, (error, stdout, stderr) => {
            if (error) {
                outputChannel.appendLine(`Failed to run Hatari: ${error.message}`);
                if (stderr) outputChannel.appendLine(stderr);
                vscode.window.showErrorMessage('Failed to run program. Check output for details.');
                return;
            }

            if (stdout) outputChannel.appendLine(stdout);
        });
    });

    context.subscriptions.push(compileDisposable);
    context.subscriptions.push(runDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
