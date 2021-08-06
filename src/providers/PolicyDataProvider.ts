import * as vscode from 'vscode';

export function getPolicyDataProvider() :PolicyDataProvider {
    let data = ["abc", "bcd", "efg"];
    return new PolicyDataProvider(data);
}


class PolicyDataProvider implements vscode.TreeDataProvider<PolicyItem> {
    onDidChangeTreeData?: vscode.Event<PolicyItem | null | undefined> | undefined;
    policyData: PolicyItem[];
    constructor(data: string[]) {
        this.policyData = [];
        if (data.length > 0) {
            data.forEach(d => {
                this.policyData.push(new PolicyItem(d,[new PolicyItem("xyz")]));
            });
        }
    }

    getTreeItem(element: PolicyItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: PolicyItem | undefined): vscode.ProviderResult<PolicyItem[]> {
        if (element === undefined) {
            return this.policyData;
        }
        return element.children;
    }
}

class PolicyItem extends vscode.TreeItem {
    children: PolicyItem[] | undefined;

    constructor(label: string, children?: PolicyItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
                vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }

    getLabel():string{
        return "";
    }
}