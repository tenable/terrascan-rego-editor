import { ExtensionContext, window, workspace, Uri, ProgressOptions, ProgressLocation } from 'vscode';
import { existsSync, writeFileSync } from 'fs';
import { TerrascanDownloader } from '../downloader/terrascanDownloader';
import { sep, join } from 'path';
import { platform } from 'os';
import { ParsedUri } from '../types/parsedUri';
import * as path from "path";
import { VariableType } from '../interface/regoElement';
import * as constants from '../constants';

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

    static writeFile(content: string, fileName: string, ext: string, loc: string): Uri {
        const filePath = join(loc, fileName + ext);
        writeFileSync(filePath, content, {
            encoding: "utf8",
            flag: "w"
        });
        return Uri.file(filePath);
    }

    static downloadTools(context: ExtensionContext) {

        let progressOptions: ProgressOptions = {
            location: ProgressLocation.Notification,
            title: constants.DOWNLOADING_REGO_EDITOR_TOOLS,
            cancellable: false
        };

        return window.withProgress(progressOptions, async (progress) => {

            progress.report({ increment: 10 });

            return new TerrascanDownloader(context).downloadBinary(progress)
                .then(isTerrascanDownloaded => {
                    window.showInformationMessage("Rego Editor tools downloaded successfully");
                })
                .catch((error) => {
                    window.showErrorMessage("Couldn't download Rego Editor tools, error: " + error);
                });
        });
    }

    static parseUri(uri: Uri): ParsedUri {
        let filePath = uri.fsPath;
        let folderPath = path.dirname(filePath);
        let fileName = path.basename(filePath);
        return new ParsedUri(filePath, folderPath, fileName);
    }

    static defaultVal(type: VariableType): any {
        switch (type) {
            case VariableType.object: return '{}';
            case VariableType.array: return '[]';
            case VariableType.string: return '""';
            case VariableType.number: return 0;
            case VariableType.boolean: return false;
        }
    }

    static leftFillNum(num:number, targetLength:number=4, padChar:string="0") {
        return num.toString().padStart(targetLength, padChar);
    }
}