import * as vscode from 'vscode';
import * as path from 'path';
import prettier from 'prettier';
import * as fs from 'fs';
import {outputChannel} from './outputChannel';

// Create an output channel for logging messages

export async function getPrettierInstance(document: vscode.TextDocument): Promise<typeof import('prettier') | null> {
    // Get the workspace folder for the given document
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        outputChannel.appendLine('No workspace folder found.');
        return null;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    let prettierPath: string;

    // This is the file path of the generated Prettier SDK created by yarn for vscode
    const sdkPrettierPath = path.join(workspacePath, '.yarn/sdks/prettier/index.cjs');
    if (fs.existsSync(sdkPrettierPath)) {
        // If the Prettier SDK file exists, use this path
        prettierPath = sdkPrettierPath;
        outputChannel.appendLine(`Using Prettier from .yarn/sdks/prettier/index.cjs: ${prettierPath}`);
    } else {
        // Check if Yarn PnP is enabled at the workspace path
        try {
            // Try to require the .pnp.cjs file to check for Yarn PnP
            const pnp = require(path.join(workspacePath, '.pnp.cjs'));
            // Resolve the Prettier path using Yarn PnP
            prettierPath = pnp.resolveRequest('prettier', workspacePath);
        } catch (pnpError) {
            // If Yarn PnP is not enabled, try to resolve Prettier using require.resolve
            try {
                prettierPath = require.resolve('prettier', {paths: [workspacePath]});
            } catch (resolveError) {
                // Log an error message if Prettier cannot be resolved
                outputChannel.appendLine('Error resolving Prettier path: ' + resolveError);
                return prettier;
            }
        }
    }

    // Log the resolved Prettier path
    outputChannel.appendLine(`Using local Prettier instance from ${prettierPath}`);
    console.log(`Resolved Prettier path: ${prettierPath}`);
    // Return the resolved Prettier instance
    return require(prettierPath);
}
