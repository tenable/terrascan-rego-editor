import { MetadataJSON } from "../interface/terrascanMetadata";
import { Policy } from "../providers/PolicyDataProvider";
import { Utils } from "../utils/utils";
import * as vscode from "vscode";
import { EXT_JSON, EXT_REGO } from "../constants";
import { LogUtils } from "../logger/loggingHelper";

export async function downloadPolicy(policy: Policy) {

    LogUtils.logMessage("Executing 'Download' command!");

    let ruleMetadata: MetadataJSON = {
        category: policy.policyObj.category!,
        description: policy.policyObj.ruleDisplayName!,
        file: policy.policyObj.ruleName + ".rego",
        id: policy.policyObj.ruleReferenceId!,
        name: policy.policyObj.ruleName,
        policy_type: "AWS",
        reference_id: policy.policyObj.ruleReferenceId!,
        resource_type: policy.policyObj.resourceType,
        severity: policy.policyObj.severity,
        template_args: {
            name: policy.policyObj.ruleName,
            prefix: "",
            suffix: ""
        },
        version: String(policy.policyObj.version)
    };

    let configUri = Utils.writeFile(JSON.stringify(ruleMetadata), policy.policyObj.ruleName, EXT_JSON, vscode.workspace.workspaceFolders![0].uri.fsPath);

    vscode.workspace.openTextDocument(configUri).then(doc => {
        vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside
        });
    });

    let regoUri = Utils.writeFile(policy.policyObj.ruleTemplate, policy.policyObj.ruleName, EXT_REGO, vscode.workspace.workspaceFolders![0].uri.fsPath);

    vscode.workspace.openTextDocument(regoUri).then(doc => {
        vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside
        });
    });
}