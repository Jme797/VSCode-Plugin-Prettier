import * as vscode from 'vscode';
import * as path from 'path';
import prettier from 'prettier';
import * as fs from 'fs';
import {outputChannel} from './outputChannel';

// Create an output channel for logging messages

export async function getPrettierInstance(document: vscode.TextDocument): Promise<typeof import('prettier') | null> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        outputChannel.appendLine('No workspace folder found.');
        return null;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    let prettierPath: string;

    const sdkPrettierPath = path.join(workspacePath, '.yarn/sdks/prettier/index.cjs');
    if (fs.existsSync(sdkPrettierPath)) {
        prettierPath = sdkPrettierPath;
        outputChannel.appendLine(`Using Prettier from .yarn/sdks/prettier/index.cjs: ${prettierPath}`);
    } else {
        const pnpPath = path.join(workspacePath, '.pnp.cjs');
        if (fs.existsSync(pnpPath)) {
            try {
                const pnp = require(pnpPath);
                prettierPath = pnp.resolveRequest('prettier', workspacePath);
            } catch (pnpError) {
                outputChannel.appendLine('Error resolving Prettier path using Yarn PnP: ' + pnpError);
                return prettier;
            }
        } else {
            try {
                prettierPath = require.resolve('prettier', {paths: [workspacePath]});
            } catch (resolveError) {
                outputChannel.appendLine('Error resolving Prettier path: ' + resolveError);
                return prettier;
            }
        }
    }

    outputChannel.appendLine(`Using local Prettier instance from ${prettierPath}`);
    return require(prettierPath);
}
