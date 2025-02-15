import * as vscode from 'vscode';
import * as prettier from 'prettier';
import * as fs from 'fs';
import * as path from 'path';

let disposables: vscode.Disposable[] = [];

export const activate = async (context: vscode.ExtensionContext) => {
    let disposable = vscode.commands.registerCommand('extension.formatWithPrettier', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const options = await prettier.resolveConfig(document.fileName);
        const configFilePath = await prettier.resolveConfigFile(document.fileName);

        if (configFilePath) {
            const configFileContents = fs.readFileSync(configFilePath, 'utf8');
            console.log(`Resolved Prettier config file path: ${configFilePath}`);
            console.log(`Resolved Prettier config file contents: ${configFileContents}`);
            vscode.window.showInformationMessage(`Resolved Prettier config file path: ${configFilePath}`);
        } else {
            console.log('No Prettier config file found.');
            vscode.window.showInformationMessage('No Prettier config file found.');
        }

        try {
            const formatted = await prettier.format(text, { ...options, filepath: document.fileName });
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
            edit.replace(document.uri, fullRange, formatted);
            await vscode.workspace.applyEdit(edit);
            await document.save();
            vscode.window.showInformationMessage('Document formatted successfully with Prettier.');
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage('Prettier formatting failed: ' + error.message);
            }
        }
    });

    context.subscriptions.push(disposable);
    disposables.push(disposable);

    const info = await prettier.getSupportInfo();
    const vscodeLanguages: string[] = [];
    info.languages.forEach(lang => {
        if (lang.vscodeLanguageIds) {
            vscodeLanguages.push(...lang.vscodeLanguageIds);
        }
    });

    vscodeLanguages.forEach(language => {
        const provider = vscode.languages.registerDocumentFormattingEditProvider(
            { scheme: 'file', language },
            {
                async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
                    const text = document.getText();
                    const options = await prettier.resolveConfig(document.fileName);
                    const configFilePath = await prettier.resolveConfigFile(document.fileName);

                    if (configFilePath) {
                        const configFileContents = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Resolved Prettier config file path: ${configFilePath}`);
                        console.log(`Resolved Prettier config file contents: ${configFileContents}`);
                        vscode.window.showInformationMessage(`Resolved Prettier config file path: ${configFilePath}`);
                    } else {
                        console.log('No Prettier config file found.');
                        vscode.window.showInformationMessage('No Prettier config file found.');
                    }

                    const formatted = await prettier.format(text, { ...options, filepath: document.fileName });
                    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
                    return [vscode.TextEdit.replace(fullRange, formatted)];
                },
            },
        );
        context.subscriptions.push(provider);
        disposables.push(provider);
    });
}

export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}
