import * as vscode from 'vscode';
import { Utils } from './utils/utils';
import { TerrascanDownloader } from './downloader/terrascanDownloader';
import { generateConfigCommand as generateConfig } from "./commands/generateConfigCommand";

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    if (!Utils.isTerrascanBinaryPresent(context)) {
        Utils.downloadTools(context);
    }

    let generateConfigCommand = vscode.commands.registerCommand('regoeditor.generateConfig', async (uri: vscode.Uri) => generateConfig(context, uri));
    
    let generateRegoCommand = vscode.commands.registerCommand('regoeditor.generateRego', () => {
        vscode.window.showInformationMessage('Command not implemented !!');
    });

    context.subscriptions.push(
        generateRegoCommand,
        generateConfigCommand
    );
}

// this method is called when the extension is deactivated
export function deactivate() { }
