import * as vscode from 'vscode';
import { sep } from 'path';
import { fetchAllCustomRules } from '../commands/fetchCustomRules';
import { BackendPolicyObject } from '../interface/backendMetadata';

export class PolicyDataProvider implements vscode.TreeDataProvider<Policy> {
    private _onDidChangeTreeData: vscode.EventEmitter<Policy | undefined | void> = new vscode.EventEmitter<Policy | undefined | void>();

    readonly onDidChangeTreeData: vscode.Event<Policy | undefined | void> = this._onDidChangeTreeData.event;

    constructor(public context: vscode.ExtensionContext) { }

    fetch(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Policy): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: Policy | undefined): Promise<Policy[]> {
        if (element) {
            return [];
        }

        let arrPolicyItem: Policy[] = [];

        let allRules = await fetchAllCustomRules();
        if (allRules && allRules.length > 0) {
            allRules.forEach(rule => {
                let p: Policy = new Policy({
                    engineType: rule.engineType,
                    policy: rule.policy,
                    provider: rule.provider,
                    resourceType: rule.resourceType,
                    ruleName: rule.ruleName,
                    ruleTemplate: rule.ruleTemplate,
                    severity: rule.severity,
                    vulnerability: rule.vulnerability
                }, this.context);
                arrPolicyItem.push(p);
            });
        }

        if (arrPolicyItem.length > 0) {
            return arrPolicyItem;
        }
        return [];
    }
}

const lightPolicyImage = "assets" + sep + "light" + sep + "dependency.svg";
const darkPolicyImage = "assets" + sep + "dark" + sep + "dependency.svg";

export class Policy extends vscode.TreeItem {

    constructor(public policyObj: BackendPolicyObject, public context: vscode.ExtensionContext) {
        super(policyObj.ruleName, vscode.TreeItemCollapsibleState.None);
        this.description = policyObj.ruleDisplayName;
        this.contextValue = "policy";
        this.iconPath = {
            light: this.context.extensionUri.fsPath + sep + lightPolicyImage,
            dark: this.context.extensionUri.fsPath + sep + darkPolicyImage
        };
    }

    getLabel(): string | vscode.TreeItemLabel | undefined {
        return this.label;
    }
}