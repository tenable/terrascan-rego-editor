import { HttpClient } from "typed-rest-client/HttpClient";
import { IHeaders } from "typed-rest-client/Interfaces";
import * as vscode from "vscode";
import { BackendPolicyObject } from "../interface/backendMetadata";
import { LogUtils } from "../logger/loggingHelper";
import * as regoEditorConfig from "../utils/configuration";

export async function fetchAllCustomRules(): Promise<BackendPolicyObject[] | undefined | void> {
    let obj: BackendPolicyObject[] | void = [];

    const fetchAllCustomRulesEndPoint: string = "/v1/api/rule";

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

    let headers: IHeaders = {
        "Authorization": "Bearer " + appToken
    };

    let client = new HttpClient("rego-editor");
    obj = await client.get(targetEnv + fetchAllCustomRulesEndPoint, headers)
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
            LogUtils.logMessage(`rule uploaded to Accurics backend successfully, output: ${data}`);
            vscode.window.showInformationMessage(`rule upload successful, response: ${data}`);
            let allRules: BackendPolicyObject[];
            allRules = JSON.parse(data);
            return allRules;
        }).catch((error) => {
            LogUtils.logMessage(`rule upload to Accurics backend failed, error: ${error.message}`);
            vscode.window.showErrorMessage(`error while connecting to '${targetEnv}', error: ${error.message}`);
        });

    return obj;
}