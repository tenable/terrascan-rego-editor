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

export function getProvider(): string {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    return <string>regoEditorConfig.get("provider");
}

export function isUseDefaultProvider(): boolean {
    let regoEditorConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(rootConfig);
    return <boolean>regoEditorConfig.get("useDefaultProvider");
}

export function initializeStatusBarItem(command: string): void {
    statusBarItem.command = command;
    statusBarItem.text = rootConfig;
    statusBarItem.show();
};

export function isBackendConfigValid(): boolean {
    let targetEnv: string = getTargetEnv();
    let appToken: string = getApplicationToken();

    if (!(targetEnv || targetEnv.trim())) {
        vscode.window.showErrorMessage("Target Environment not configured. Please run 'RegoEditor: Configuration' command to set target environment");
        return false;
    }

    if (!(appToken || appToken.trim())) {
        vscode.window.showErrorMessage("Application Token not configured. Please run 'RegoEditor: Configuration' command to set App Token");
        return false;
    }

    return true;
}