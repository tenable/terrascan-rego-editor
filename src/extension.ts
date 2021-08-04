import * as vscode from 'vscode';
import { Utils } from './utils/utils';
import { generateRego } from './commands/generateRego';
import { generateConfigCommand as generateConfig } from "./commands/generateConfig";
import { LogUtils } from './logger/loggingHelper';
import { RegoLogger } from './logger/regoLogger';
import { scan } from "./commands/scan";
import { initializeStatusBarItem } from './utils/configuration';

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // initialize extension logger
    LogUtils.setLoggerObject(new RegoLogger(context));
    LogUtils.logMessage('rego-editor activated!');

    // initialize status bar item for configure command
    initializeStatusBarItem("regoeditor.configure");

    if (!Utils.isTerrascanBinaryPresent(context)) {
        Utils.downloadTools(context);
    }

    let generateConfigCommand = vscode.commands.registerCommand('regoeditor.generateConfig', async (uri: vscode.Uri) => generateConfig(context, uri));

    let generateRegoCommand = vscode.commands.registerCommand('regoeditor.generateRego', async (uri: vscode.Uri) => generateRego(context, uri));

    let scanCommand = vscode.commands.registerCommand('regoeditor.scan', async (uri: vscode.Uri) => scan(context, uri));

    let configureCommand = vscode.commands.registerCommand("regoeditor.configure", () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:AccuricsInc.regoeditor');
    });

    context.subscriptions.push(
        generateRegoCommand,
        generateConfigCommand,
        scanCommand,
        configureCommand
    );
}

// this method is called when the extension is deactivated
export function deactivate() { }
