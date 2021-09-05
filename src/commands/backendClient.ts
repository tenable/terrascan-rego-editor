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

import * as vscode from 'vscode';
import { HttpClient } from "typed-rest-client/HttpClient";
import { IHeaders } from "typed-rest-client/Interfaces";
import { BackendPolicyObject, RuleResponse } from "../interface/backendMetadata";
import { LogUtils } from "../logger/loggingHelper";

export class BackendClient {

    private _requestTimeout: number = 10000;
    private _client: string = "rego-editor";
    private _getRulesEndpoint: string = "/v1/api/app/rule";
    private _pushRulesEndpoint: string = "/v1/api/app/rule";
    private _header: IHeaders;

    constructor(public host: string, public appToken: string) {
        // strip single '/' from the end of the URL
        if (host.trim().charAt(host.length - 1) === '/') {
            this.host = host.substr(0, host.length - 1);
        }

        this._header = {
            "Authorization": "Bearer " + this.appToken
        };
    }

    async getRules(): Promise<RuleResponse | undefined> {

        LogUtils.logMessage("sending request to get rules to Accurics backend");

        let client = new HttpClient(this._client);
        return client.get(this.host + this._getRulesEndpoint + "?custom=true", this._header)
            .then((response) => {
                let respMsg = response.message;
                respMsg = respMsg.setTimeout(this._requestTimeout, () => {
                    throw new Error("request timed out after 10 seconds, please check if target environment is up.");
                });

                // handle different status codes valid for Accurics backend
                switch (respMsg.statusCode) {
                    case 200:
                        return response.readBody();
                    case 401:
                        throw new Error(`please make sure the 'App Token' is valid, response code: ${respMsg.statusCode},error message: ${respMsg.statusMessage}`);
                    default:
                        throw new Error(`unable to fetch rules, response code: ${respMsg.statusCode}, error message: ${respMsg.statusMessage}`);
                }
            }).then(data => {
                let allRules: RuleResponse;
                allRules = JSON.parse(data);
                if (allRules.count === 0) {
                    LogUtils.logMessage(`request successful, no custom rules are present in the target environment`);
                    vscode.window.showInformationMessage(`request successful, no custom rules are present in the target environment`);
                } else {
                    LogUtils.logMessage(`rules successfully downloaded from Accurics backend, rule count ${allRules.count}`);
                    vscode.window.showInformationMessage(`rules successfully downloaded from Accurics backend, rule count ${allRules.count}`);
                }
                return allRules;
            }).catch((error) => {
                LogUtils.logMessage(`downloading rules from Accurics backend failed, error: ${error.message}`);
                vscode.window.showErrorMessage(`error while connecting to '${this.host}', error: ${error.message}`);
                return undefined;
            });
    }

    async pushRules(data: BackendPolicyObject[]): Promise<boolean> {

        LogUtils.logMessage("sending request to push rules to Accurics backend");

        let client = new HttpClient(this._client);
        return client.post(this.host + this._pushRulesEndpoint, JSON.stringify(data), this._header)
            .then((response) => {
                let respMsg = response.message;
                respMsg = respMsg.setTimeout(this._requestTimeout, () => {
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
                    return false;
                }
                LogUtils.logMessage(`rule uploaded to Accurics backend successfully, output: ${data}`);
                vscode.window.showInformationMessage(`rule upload successful`);
                return true;
            }).catch((error) => {
                LogUtils.logMessage(`rule upload to Accurics backend failed, error: ${error.message}`);
                vscode.window.showErrorMessage(`error while connecting to '${this.host}', error: ${error.message}`);
                return false;
            });
    }
}
