import * as vscode from 'vscode';
import { Utils } from './utils/utils';
import { generateRego } from './commands/generateRego';
import { generateConfigCommand as generateConfig } from "./commands/generateConfig";
import { showRegoHelperTemplate } from "./commands/showRegoHelperTemplate";
import { resetPolicySuffixCounter } from "./commands/resetPolicySuffixCounter";
import { LogUtils } from './logger/loggingHelper';
import { RegoLogger } from './logger/regoLogger';
import { scan } from "./commands/scan";

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    LogUtils.setLoggerObject(new RegoLogger(context));
    LogUtils.logMessage('rego-editor activated!');

    if (!Utils.isTerrascanBinaryPresent(context)) {
        Utils.downloadTools(context);
    }

    let generateConfigCommand = vscode.commands.registerCommand('regoeditor.generateConfig', async (uri: vscode.Uri) => generateConfig(context, uri));

    let generateRegoCommand = vscode.commands.registerCommand('regoeditor.generateRego', async (uri: vscode.Uri) => generateRego(context, uri));

    let showRegoHelperTemplateCommand = vscode.commands.registerCommand('regoeditor.showRegoHelperTemplate', async () => showRegoHelperTemplate(context));

    let resetPolicySuffixCounterCommand = vscode.commands.registerCommand('regoeditor.resetPolicySuffixCounter', async () => resetPolicySuffixCounter(context));

    let scanCommand = vscode.commands.registerCommand('regoeditor.scan', async (uri: vscode.Uri) => scan(context, uri));

    context.subscriptions.push(
        generateRegoCommand,
        generateConfigCommand,
        showRegoHelperTemplateCommand,
        resetPolicySuffixCounterCommand,
        scanCommand
    );
}

// this method is called when the extension is deactivated
export function deactivate() { }
