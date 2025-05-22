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

    // Shared compile function for Atari ST binaries
    async function compileAtariST(targetOption, extraOptions = '') {
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

        // Compile using VBCC with specified options
        const compileCommand = `vc ${targetOption} ${filePath} -o ${outputFile} ${extraOptions}`.trim();
        
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
    }

    // Register TOS 32bits compile command
    let compileTOS32Disposable = vscode.commands.registerCommand('vscode-vbcc.compile-tos32', async function () {
        await compileAtariST('+tos');
    });

    // Register TOS 16bits compile command
    let compileTOS16Disposable = vscode.commands.registerCommand('vscode-vbcc.compile-tos16', async function () {
        await compileAtariST('+tos16');
    });

    // Register GEM 32bits compile command
    let compileGEM32Disposable = vscode.commands.registerCommand('vscode-vbcc.compile-gem32', async function () {
        await compileAtariST('+tos', '-lgem');
    });

    // Register GEM 16bits compile command
    let compileGEM16Disposable = vscode.commands.registerCommand('vscode-vbcc.compile-gem16', async function () {
        await compileAtariST('+tos16', '-lgem16');
    });

    // Register make command
    let runMakeDisposable = vscode.commands.registerCommand('vscode-vbcc.make', async function () {
        // Get workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        
        const rootPath = workspaceFolders[0].uri.fsPath;
        
        // Look for Makefile in root (trying common variations)
        const makefileNames = ['Makefile', 'makefile'];
        let makefilePath = null;
        
        for (const name of makefileNames) {
            const testPath = path.join(rootPath, name);
            if (fs.existsSync(testPath)) {
                makefilePath = testPath;
                break;
            }
        }
        
        if (!makefilePath) {
            vscode.window.showErrorMessage('No Makefile found in project root');
            return;
        }

        // Clear output channel
        outputChannel.clear();
        outputChannel.show();

        // Run make with found Makefile
        const compileCommand = `make -f "${makefilePath}"`;
        
        exec(compileCommand, { cwd: rootPath }, (error, stdout, stderr) => {
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

        // Try to find Hatari executable
        let hatariPath = 'hatari'; // default to PATH
        
        // Check common macOS location first
        const macOSHatariPath = '/Applications/Hatari.app/Contents/MacOS/Hatari';
        if (process.platform === 'darwin' && fs.existsSync(macOSHatariPath)) {
            hatariPath = macOSHatariPath;
        }

        // Run using Hatari
        const runCommand = `"${hatariPath}" "${tosFile}"`;
        
        exec(runCommand, { cwd: fileDir }, (error, stdout, stderr) => {
            if (error) {
                // Check if it's a "command not found" error
                if (error.code === 'ENOENT') {
                    outputChannel.appendLine('Hatari not found. Please make sure Hatari is installed and either:');
                    outputChannel.appendLine('1. Install it in /Applications/Hatari.app (macOS)');
                    outputChannel.appendLine('2. Add it to your system PATH');
                    vscode.window.showErrorMessage('Hatari not found. Check output for installation instructions.');
                    return;
                }
                
                outputChannel.appendLine(`Failed to run Hatari: ${error.message}`);
                if (stderr) outputChannel.appendLine(stderr);
                vscode.window.showErrorMessage('Failed to run program. Check output for details.');
                return;
            }

            if (stdout) outputChannel.appendLine(stdout);
        });
    });

    context.subscriptions.push(compileTOS32Disposable);
    context.subscriptions.push(compileTOS16Disposable);
    context.subscriptions.push(compileGEM32Disposable);
    context.subscriptions.push(compileGEM16Disposable);
    context.subscriptions.push(runMakeDisposable);
    context.subscriptions.push(runDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
