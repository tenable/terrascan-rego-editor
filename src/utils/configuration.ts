import * as vscode from "vscode";

const rootConfig: string = "regoeditor";
const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem();

export function getTargetEnv(): string {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    return <string>regoEditorConfig.get("targetEnv");
}

export function getApplicationToken(): string {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    return <string>regoEditorConfig.get("appToken");
}

export function getPolicySuffixCounter(): number {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    return <number>regoEditorConfig.get("policySuffixCounter");
}

export function setPolicySuffixCounter(value: number) {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    regoEditorConfig.update("policySuffixCounter", value, true);
}

export function getShowHelperTemplate(): boolean {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    return <boolean>regoEditorConfig.get("showRegoHelperTemplate");
}

export function setShowHelperTemplate(value: boolean) {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    regoEditorConfig.update("showRegoHelperTemplate", value, true);
}

export function initializeStatusBarItem(command: string): void {
    statusBarItem.command = command;
    statusBarItem.text = rootConfig;
    statusBarItem.show();
};