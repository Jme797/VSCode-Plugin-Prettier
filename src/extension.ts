import * as vscode from 'vscode';
import { getPrettierInstance } from './prettierResolver';
import { outputChannel } from './outputChannel';

let disposables: vscode.Disposable[] = [];

/**
 * Formats the given document using Prettier.
 * @param document The document to format.
 */
async function formatDocument(document: vscode.TextDocument) {
    const text = document.getText();
    const fileName = document.fileName;
    outputChannel.appendLine(`Document file name: ${fileName}`);

    // Get the Prettier instance for the document
    const prettier = await getPrettierInstance(document);
    if (!prettier) {
        outputChannel.appendLine('Prettier is not available');
        return;
    }

    try {
        // Resolve Prettier configuration options for the document
        const options = await prettier.resolveConfig(fileName);
        outputChannel.appendLine(`Resolved Prettier options: ${JSON.stringify(options, null, 2)}`);
        // Resolve the Prettier configuration file path for the document
        const configFilePath = await prettier.resolveConfigFile(fileName);
        outputChannel.appendLine(`Resolved Prettier config file path: ${configFilePath}`);

        // Format the document text using Prettier
        const formatted = await prettier.format(text, { ...options, filepath: fileName });
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        edit.replace(document.uri, fullRange, formatted);
        await vscode.workspace.applyEdit(edit);
        await document.save();
        outputChannel.appendLine('Document formatted successfully with Prettier.');
    } catch (error) {
        if (error instanceof Error) {
            outputChannel.appendLine(`Prettier formatting failed: ${error.message} \n ${error.stack}`);
        } else {
            outputChannel.appendLine('Prettier formatting failed with an unknown error.');
        }
    }
}

/**
 * Activates the Prettier VSCode extension.
 * @param context The extension context.
 */
export const activate = async (context: vscode.ExtensionContext) => {
    outputChannel.appendLine('Activating Prettier VSCode Extension...');

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        outputChannel.appendLine('No active editor found.');
        return;
    }

    // Get the Prettier instance for the active editor's document
    const prettier = await getPrettierInstance(activeEditor.document);
    if (prettier) {
        outputChannel.appendLine(`Prettier version: ${prettier.version}`);
    } else {
        outputChannel.appendLine('Prettier is not available');
        return;
    }

    outputChannel.show(true);

    try {
        // Register the command to format the document with Prettier
        let disposable = vscode.commands.registerCommand('extension.formatWithPrettier', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                outputChannel.appendLine('No active editor found.');
                return;
            }

            outputChannel.appendLine('Formatting document with Prettier...');
            await formatDocument(editor.document);
        });

        context.subscriptions.push(disposable);
        disposables.push(disposable);

        // Get Prettier support information and register document formatting providers
        const prettierSupportInfo = await prettier.getSupportInfo();
        const vscodeLanguages = [];
        for (const language of prettierSupportInfo.languages) {
            vscodeLanguages.push(...language.vscodeLanguageIds || []);
        }

        vscodeLanguages.forEach(language => {
            const provider = vscode.languages.registerDocumentFormattingEditProvider(
                { scheme: 'file', language },
                {
                    async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
                        outputChannel.appendLine('Formatting document with Prettier...');
                        await formatDocument(document);
                        const text = document.getText();
                        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
                        return [vscode.TextEdit.replace(fullRange, text)];
                    },
                },
            );
            context.subscriptions.push(provider);
            disposables.push(provider);
        });

        outputChannel.appendLine('Prettier VSCode Extension activated successfully.');
    } catch (error) {
        if (error instanceof Error) {
            outputChannel.appendLine(`Failed to activate Prettier VSCode Extension: ${error.message}`);
        } else {
            outputChannel.appendLine('Failed to activate Prettier VSCode Extension: Unknown error');
        }
    }
};

/**
 * Deactivates the Prettier VSCode extension.
 */
export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
    outputChannel.appendLine('Prettier VSCode Extension deactivated.');
}
