import * as vscode from 'vscode';
import { Utils } from './utils/utils';
import { TerrascanDownloader } from './downloader/terrascanDownloader';
import { generateRego } from './commands/generateRego';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    console.log('extension active');

    if (!Utils.isTerrascanBinaryPresent(context)) {
        downloadTools(context);
    }

    let generateConfigCommand = vscode.commands.registerCommand('regoeditor.generateConfig', () => {
        vscode.window.showInformationMessage('Command not implemented !!');
    });
    context.subscriptions.push(generateConfigCommand);

    let generateRegoCommand = vscode.commands.registerCommand('regoeditor.generateRego', async (uri: vscode.Uri) => generateRego(uri));
    context.subscriptions.push(generateRegoCommand);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function downloadTools(context: vscode.ExtensionContext) {

    let progressOptions: vscode.ProgressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: "Download Rego Editor's tools",
        cancellable: false
    };

    return vscode.window.withProgress(progressOptions, async (progress) => {

        progress.report({ increment: 10 });
        let terrascanDownload = new TerrascanDownloader(context).downloadBinary(progress, true);

        return Promise.all([terrascanDownload])
            .then(([isTerrascanDownloaded]) => {
                vscode.window.showInformationMessage("Rego Editor's tools downloaded successfully");
            })
            .catch((error) => {
                vscode.window.showErrorMessage("Couldn't download Rego Editor's tools, error: " + error);
            });
    });
}