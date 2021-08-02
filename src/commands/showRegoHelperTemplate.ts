import * as constants from "../constants";
import * as vscode from 'vscode';
import { LogUtils } from "../logger/loggingHelper";


export async function showRegoHelperTemplate(context: vscode.ExtensionContext) {
    LogUtils.logMessage("Executing 'Show Rego Helper Template' command!");
    const choice = await vscode.window.showQuickPick([constants.ENABLE_OPTION, constants.DISABLE_OPTION], { placeHolder: constants.ENABLE_DISABLE_REGO_HELPER_TEMPLATE });

    if (choice === constants.ENABLE_OPTION) {
        context.globalState.update("showRegoHelperTemplate", true);
        LogUtils.logMessage("setting show helper template to 'true'");
    } else if (choice === constants.DISABLE_OPTION) {
        context.globalState.update("showRegoHelperTemplate", false);
        LogUtils.logMessage("setting show helper template to 'false'");
    }
}