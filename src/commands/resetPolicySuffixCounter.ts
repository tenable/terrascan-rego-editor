import * as vscode from 'vscode';
import { LogUtils } from '../logger/loggingHelper';

export async function resetPolicySuffixCounter(context: vscode.ExtensionContext) {
    LogUtils.logMessage("Executing 'Reset Policy Suffix Counter' command!");

    var options: vscode.InputBoxOptions = {
        title: "Reset value",
        value: "0",
        placeHolder: "Please enter a number!",
        validateInput: validateInput

    };
    vscode.window.showInputBox(options).then(val => {
        LogUtils.logMessage(`setting suffix counter to ${Number(val)}`);
        context.globalState.update("policySuffixCounter", Number(val));
    });

}
var validateInput = (value: string): string => {
    if (!Number(value)) {
        return "Please type a valid number";
    }
    return "";
};