import * as constants from "../constants";
import * as vscode from 'vscode';


export async function showRegoHelperTemplate(context: vscode.ExtensionContext) {
    const choice = await vscode.window.showQuickPick([constants.ENABLE_OPTION, constants.DISABLE_OPTION], { placeHolder: constants.ENABLE_DISABLE_REGO_HELPER_TEMPLATE });
    
    if (choice === constants.ENABLE_OPTION) {
        context.globalState.update("showRegoHelperTemplate", true);
    } else if (choice === constants.DISABLE_OPTION) {
        context.globalState.update("showRegoHelperTemplate", false);
    }
}