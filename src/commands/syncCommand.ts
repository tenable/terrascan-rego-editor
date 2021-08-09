import * as vscode from "vscode";
import { sep } from "path";
import { HttpClient } from "typed-rest-client/HttpClient";
import { IHeaders, IRequestOptions } from "typed-rest-client/Interfaces";
import * as regoEditorConfig from "../utils/configuration";
import { BackendPolicyObject } from "../interface/backendMetadata";
import { isValidMetadataJSON, MetadataJSON } from "../interface/terrascanMetadata";
import { existsSync } from "fs";
import { LogUtils } from "../logger/loggingHelper";

export async function syncCmd(uri: vscode.Uri, isCodeLensCall: boolean) {
    const ruleUpdateEndPoint: string = "/v1/api/rule/update";

    let targetEnv: string = regoEditorConfig.getTargetEnv();
    let appToken: string = regoEditorConfig.getApplicationToken();

    if (!(targetEnv || targetEnv.trim())) {
        vscode.window.showErrorMessage("Target Environment not configured. Please run 'RegoEditor: Configuration' command to set target environment");
        return;
    }

    if (!(appToken || appToken.trim())) {
        vscode.window.showErrorMessage("Application Token not configured. Please run 'RegoEditor: Configuration' command to set App Token");
        return;
    }

    let editor = vscode.window.activeTextEditor;

    if (uri === undefined && editor === undefined) {
        vscode.window.showErrorMessage("select the rule metadata json file");
        return;
    }

    LogUtils.logMessage("Executing 'Sync' command!");

    let metadataFileContents: string = "";
    let metadataFilePath: string = "";

    if (uri) {
        let contents = await vscode.workspace.fs.readFile(uri);
        metadataFileContents = contents.toString();
        metadataFilePath = uri.fsPath;

    } else if (editor) {
        uri = editor.document.uri;
        metadataFilePath = uri.fsPath;
        if (!editor.selection.isEmpty) {
            metadataFileContents = editor.document.getText(editor.selection);
        } else {
            metadataFileContents = editor.document.getText();
        }
    } else {
        vscode.window.showErrorMessage("no file selected");
        return;
    }

    // Metadata JSON validation would be required if code lens is not enabled by the user
    // if code lens is enabled, metadata JSON validation would be done by the code lens provider
    if (!isCodeLensCall) {
        if (!isValidMetadataJSON(metadataFileContents)) {
            vscode.window.showErrorMessage("selected file is not a valid 'Terrascan Rule Metadata' json file");
            return;
        }
    }

    LogUtils.logMessage(`parsing metadata contents of file: ${uri.fsPath}`);
    let metadata: MetadataJSON = <MetadataJSON>JSON.parse(metadataFileContents);

    // read rego file
    const folderPath: string = metadataFilePath.substring(0, metadataFilePath.lastIndexOf(sep));
    const regoFilePath: string = folderPath + sep + metadata.file;

    LogUtils.logMessage(`reading rego file: ${regoFilePath}`);
    if (!existsSync(regoFilePath)) {
        LogUtils.logMessage(`rego file: ${metadata.file}, doesn't exist`);
        vscode.window.showErrorMessage(`referenced rego file '${metadata.file}' doesn't exist, please ensure the rego file name is correct`);
        return;
    }

    let regoFileURI: vscode.Uri = vscode.Uri.file(regoFilePath);
    let regoFileBytes = vscode.workspace.fs.readFile(regoFileURI);
    let regoFileContents = (await regoFileBytes).toString();

    let backendObj: BackendPolicyObject = {
        category: metadata.category,
        ruleName: metadata.name,
        ruleTemplateName: metadata.name,
        ruleDisplayName: metadata.name,
        resourceType: metadata.resource_type,
        ruleArgument: JSON.stringify(metadata.template_args),
        provider: metadata.policy_type,
        ruleTemplate: regoFileContents,
        severity: metadata.severity,
        version: String(metadata.version),
        // hardcoding below fields as they are not present in terrascan's metadata json
        engineType: "terraform",
        vulnerability: "vulnerability",
        policy: "custom policy by Rego Editor extension",
    };

    let arr: BackendPolicyObject[] = [backendObj];

    let headers: IHeaders = {
        "Authorization": "Bearer " + appToken
    };

    LogUtils.logMessage("sending http request to Accurics backend");

    let client = new HttpClient("rego-editor");
    client.post(targetEnv + ruleUpdateEndPoint, JSON.stringify(arr), headers)
        .then((response) => {
            let respMsg = response.message;
            respMsg = respMsg.setTimeout(10000, () => {
                throw new Error("request timed out after 10 seconds, please check if target environment is up.");
            });

            // handle different status codes valid for Accurics backend
            switch (respMsg.statusCode) {
                case 200:
                case 400:
                    // we need to read the body in case of a bad request
                    return response.readBody();
                case 401:
                    throw new Error(`please make sure the 'App Token' is valid, response code: ${respMsg.statusCode},error message: ${respMsg.statusMessage}`);
                default:
                    throw new Error(`unable to upload rule, response code: ${respMsg.statusCode}, error message: ${respMsg.statusMessage}`);
            }
        }).then(data => {
            if (data.includes("400")) {
                LogUtils.logMessage(`rule upload to Accurics backend failed, error: ${data}`);
                vscode.window.showErrorMessage(`rule upload failed, response: ${data}`);
            } else {
                LogUtils.logMessage(`rule uploaded to Accurics backend successfully, output: ${data}`);
                vscode.window.showInformationMessage(`rule upload successful, response: ${data}`);
            }
        }).catch((error) => {
            LogUtils.logMessage(`rule upload to Accurics backend failed, error: ${error.message}`);
            vscode.window.showErrorMessage(`error while connecting to '${targetEnv}', error: ${error.message}`);
        });
}