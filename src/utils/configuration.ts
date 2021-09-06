/*
    Copyright (C) 2021 Accurics, Inc.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

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
