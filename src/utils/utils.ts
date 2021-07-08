import { ExtensionContext, window, workspace, Uri, ProgressOptions, ProgressLocation } from 'vscode';
import { existsSync, writeFileSync } from 'fs';
import { TerrascanDownloader } from '../downloader/terrascanDownloader';

import { sep, join } from 'path';
import { platform } from 'os';

export class Utils {

    static getWorkspaceLocation(): string | undefined {
        let workspaceLocation: string = '';
        let workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined || workspaceFolders.length === 0) {
            return undefined;
        }

        workspaceLocation = workspaceFolders[0].uri.fsPath;
        return workspaceLocation;
    }

    static isWindowsPlatform(): boolean {
        return platform().includes('win32');
    }

    static isDarwinPlatform(): boolean {
        return platform().includes('darwin');
    }

    static isTerrascanBinaryPresent(context: ExtensionContext): boolean {
        let terrascanLocation: string = context.extensionUri.fsPath + sep + 'executables' + sep + 'terrascan' + sep + 'terrascan';
        if (this.isWindowsPlatform()) {
            terrascanLocation += '.exe';
        }
        return existsSync(terrascanLocation);
    }

    static saveAndOpen(content: string, fileName: string) {
        const root = this.getWorkspaceLocation();
        if (root) {
            const filePath = join(root, `${fileName}.json`);
            writeFileSync(filePath, content, {
                encoding: "utf8",
                flag: "w"
            });
            const openPath = Uri.file(filePath);
            workspace.openTextDocument(openPath).then(doc => {
                window.showTextDocument(doc);
            });
        } else {
            window.showErrorMessage("Use command from a project folder");
        }
    }

    static downloadTools(context: ExtensionContext) {

        let progressOptions: ProgressOptions = {
            location: ProgressLocation.Notification,
            title: "Download Rego Editor's tools",
            cancellable: false
        };
    
        return window.withProgress(progressOptions, async (progress) => {
    
            progress.report({ increment: 10 });
            let terrascanDownload = new TerrascanDownloader(context).downloadBinary(progress, true);
    
            return Promise.all([terrascanDownload])
                .then(([isTerrascanDownloaded]) => {
                    window.showInformationMessage("Rego Editor's tools downloaded successfully");
                })
                .catch((error) => {
                    window.showErrorMessage("Couldn't download Rego Editor's tools, error: " + error);
                });
        });
    }
}