import * as vscode from 'vscode';

export async function resetPolicySuffixCounter(context: vscode.ExtensionContext) {
    console.log("resetPolicySuffixCounter");
    
    var options: vscode.InputBoxOptions = {
        title: "Reset value",
        value: "0",
        placeHolder: "Please enter a number!",
        validateInput: validateInput

    };
    vscode.window.showInputBox(options).then(val =>{
        context.globalState.update("policySuffixCounter", Number(val));
    });
    
}
var validateInput = (value: string): string => {
    if (!Number(value)) {
        return "Please type a valid number";
    }
    return "";
};