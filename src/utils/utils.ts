import { ExtensionContext, window, workspace } from 'vscode';
import { lstatSync, existsSync } from 'fs';
import { sep } from 'path';
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
}