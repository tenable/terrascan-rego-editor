import * as vscode from 'vscode';
import { getTargetEnv } from "../utils/configuration";

export function getEnvironmentDataProvider() :EnvironmentDataProvider {
    console.log("hhh ::", getTargetEnv());
     
    let data = [getTargetEnv()];
    return new EnvironmentDataProvider(data);
}


class EnvironmentDataProvider implements vscode.TreeDataProvider<EnvironmentItem> {
    onDidChangeTreeData?: vscode.Event<EnvironmentItem | null | undefined> | undefined;
    environmentData: EnvironmentItem[];
    constructor(data: string[]) {
        this.environmentData = [];
        if (data.length > 0) {
            data.forEach(d => {
                this.environmentData.push(new EnvironmentItem(d));
            });
        }
    }

    getTreeItem(element: EnvironmentItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: EnvironmentItem | undefined): vscode.ProviderResult<EnvironmentItem[]> {
        if (element === undefined) {
            return this.environmentData;
        }
        return element.children;
    }
}

class EnvironmentItem extends vscode.TreeItem {
    children: EnvironmentItem[] | undefined;

    constructor(label: string, children?: EnvironmentItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
                vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }
}