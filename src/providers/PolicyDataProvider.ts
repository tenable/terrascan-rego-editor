import * as vscode from 'vscode';
import { fetchAllCustomRules } from '../commands/fetchCustomRules';
import { BackendPolicyObject } from '../interface/backendMetadata';

const CONTEXT_VALUE_PROVIDER = "provider";
const CONTEXT_VALUE_POLICY = "policy";

// VS Code built-in icon, Refer https://code.visualstudio.com/api/references/icons-in-labels for more built-in icons
const POLICY_ICON = "shield";

export class PolicyDataProvider implements vscode.TreeDataProvider<PolicyData> {
    private _onDidChangeTreeData: vscode.EventEmitter<PolicyData | undefined | void> = new vscode.EventEmitter<PolicyData | undefined | void>();

    readonly onDidChangeTreeData: vscode.Event<PolicyData | undefined | void> = this._onDidChangeTreeData.event;

    constructor(public context: vscode.ExtensionContext) { }

    fetch(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PolicyData): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: PolicyData | undefined): Promise<PolicyData[]> {
        if (element) {
            if (element instanceof PolicyType) {
                return element.getChildren();
            }
            return [];
        }

        let allRules = await fetchAllCustomRules();

        let providers: PolicyType[] = [];
        if (allRules && allRules.length > 0) {
            let group = allRules.reduce((m, r) => {
                m.set(r.provider, [...m.get(r.provider) || [],
                new Policy(r, this.context)
                ]);
                return m;
            }, new Map<String, Policy[]>());

            group.forEach((v, k) => {
                let provider = new PolicyType(k.toString(), this.context);
                provider.addChildren(v);
                providers.push(provider);
            });
        }

        return providers;
    }
}

export abstract class PolicyData extends vscode.TreeItem {

    constructor(public name: string, contextValue: string, collapsable: vscode.TreeItemCollapsibleState) {
        super(name, collapsable);
        this.contextValue = contextValue;
    }

    abstract getChildren(): PolicyData[];
    abstract addChildren(children: PolicyData[]): void;

}

export class Policy extends PolicyData {

    constructor(public policyObj: BackendPolicyObject, public context: vscode.ExtensionContext) {
        super(policyObj.ruleName, CONTEXT_VALUE_POLICY, vscode.TreeItemCollapsibleState.None);
        this.description = policyObj.ruleDisplayName;
        this.iconPath = new vscode.ThemeIcon(POLICY_ICON);
    }

    getLabel(): string | vscode.TreeItemLabel | undefined {
        return this.label;
    }

    addChildren(children: Policy[]) {
        return;
    }

    getChildren(): Policy[] {
        return [];
    }
}

export class PolicyType extends PolicyData {
    children: Policy[] = [];

    constructor(public policyType: string, public context: vscode.ExtensionContext) {
        super(policyType, CONTEXT_VALUE_PROVIDER, vscode.TreeItemCollapsibleState.Collapsed);
        this.description = `Policies for type ${policyType.toUpperCase()}`;
        this.iconPath = vscode.ThemeIcon.Folder;
    }

    addChildren(children: Policy[]) {
        this.children = children;
    }

    getChildren(): Policy[] {
        return this.children;
    }

}

