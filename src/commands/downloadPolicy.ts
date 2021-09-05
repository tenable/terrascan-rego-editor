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

import { MetadataJSON, TemplateArg } from "../interface/terrascanMetadata";
import { Policy } from "../providers/PolicyDataProvider";
import { Utils } from "../utils/utils";
import * as vscode from "vscode";
import { EXT_JSON, EXT_REGO } from "../constants";
import { LogUtils } from "../logger/loggingHelper";

export async function downloadPolicy(policy: Policy) {

    LogUtils.logMessage("Executing 'Download' command!");

    let ruleMetadata: MetadataJSON = {
        name: policy.policyObj.ruleDisplayName,
        file: policy.policyObj.ruleName + ".rego",
        template_args: getTemplateArgs(policy.policyObj.ruleArgument),
        severity: policy.policyObj.severity,
        description: policy.policyObj.remediation!,
        reference_id: policy.policyObj.ruleReferenceId,
        id: policy.policyObj.ruleReferenceId,
        category: policy.policyObj.category!,
        version: Number(policy.policyObj.version),
        policy_type: policy.policyObj.provider,
        resource_type: policy.policyObj.resourceType
    };

    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage("No folder open in VS Code!");
        vscode.commands.executeCommand("workbench.view.explorer");
        return;
    }
    let configUri = Utils.writeFile(JSON.stringify(ruleMetadata, null, "\t"), policy.policyObj.ruleName, EXT_JSON, vscode.workspace.workspaceFolders![0].uri.fsPath);

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

function getTemplateArgs(text: string | undefined): TemplateArg {

    return (text) ? JSON.parse(text) : {
        name: "",
        prefix: "",
        suffix: ""
    };


}
