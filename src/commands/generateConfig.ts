/*
    Copyright (C) 2022 Tenable, Inc.
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

import { ExtensionContext, window, OutputChannel, Uri, ProgressLocation, workspace } from "vscode";
import { Utils } from "../utils/utils";
import * as constants from '../constants';
import { TerrascanDownloader } from '../downloader/terrascanDownloader';
import { sep } from "path";
import { exec } from "child_process";
import * as path from "path";
import { LogUtils } from "../logger/loggingHelper";
import stripAnsi = require("strip-ansi");
import { getProvider, isUseDefaultProvider } from "../utils/configuration";


export async function generateConfigCommand(context: ExtensionContext, uri: Uri) {

    // prompt for IAC type
    const iacType = await window.showQuickPick(constants.TERRASCAN_IAC_TYPES, { placeHolder: constants.IAC_TYPE_QUICK_PICK_PLACEHOLDER });
    const generateConfigAbortMessage: string = "Config generation aborted!";

    if (iacType !== undefined) {

        if (isUseDefaultProvider()) {

            executeGenerateConfig(context, uri, iacType, getProvider());
        } else {

            const providerType = await window.showQuickPick(constants.TERRASCAN_PROVIDER_TYPES, { placeHolder: constants.PROVIDER_TYPE_QUICK_PICK_PLACEHOLDER });

            if (providerType !== undefined) {
                executeGenerateConfig(context, uri, iacType, providerType);
            } else {
                window.showErrorMessage(generateConfigAbortMessage);
            }
        }
    } else {
        window.showErrorMessage(generateConfigAbortMessage);
    }
}

async function executeGenerateConfig(context: ExtensionContext, uri: Uri, iacType: string, providerType: string) {
    window.withProgress({
        location: ProgressLocation.Window,
        cancellable: false,
        title: 'Generating Config'
    }, async (progress) => {
        progress.report({ increment: 0 });
        generateConfig(context, uri, iacType, providerType);
        progress.report({ increment: 100 });
    });
}

// generate config json from iac files resources
async function generateConfig(context: ExtensionContext, uri: Uri, iacType: string, providerType: string) {
    LogUtils.logMessage("Executing 'Generate Config' command!");

    if (!Utils.isTerrascanBinaryPresent(context)) {
        let userAction = await window.showInformationMessage(constants.REGO_EDITOR_TOOLS_NOT_INSTALLED, constants.INSTALL_OPTION);
        if (userAction !== undefined) {
            try {
                await new TerrascanDownloader(context).downloadWithProgress();
                window.showInformationMessage(constants.REGO_EDITOR_TOOLS_DOWNLOAD_SUCCESS);
            } catch (error: any) {
                window.showErrorMessage(constants.REGO_EDITOR_TOOLS_DOWNLOAD_FAILURE + error.message);
                return;
            }
        }
    }

    const parsedUri = Utils.parseUri(uri);

    let scanOptions = `-i ${iacType} -f ${parsedUri.filePath} -o json --config-only`;

    let terrascanLocation: string = context.extensionPath + sep + 'executables' + sep + 'terrascan' + sep + 'terrascan';
    if (Utils.isWindowsPlatform()) {
        terrascanLocation += '.exe';
    }

    exec(`${terrascanLocation} scan ${scanOptions}`, (error, stdout, stderr) => {
        LogUtils.logMessage(`CMD : terrascan scan ${scanOptions}`);
        let configJson: string = "";

        // if process exits with error
        if (!!error) {
            window.showErrorMessage('Config generation failed!');
            // LogUtils.logMessage(`ERROR : ${error.message}`);
            LogUtils.logMessage(`ERROR : ${stripAnsi(stderr)}`);
            return;
        } else {
            if (stderr && stderr.trim()) {
                window.showErrorMessage('Config generation failed!');
                LogUtils.logMessage(`ERROR : ${stripAnsi(stderr)}`);
                return;
            }
            LogUtils.logMessage("config generation completed");
            configJson = stdout;
        }

        // check if valid resource exist in configJson
        if (!!configJson && configJson !== "{}\n") {
            let configWrapper = JSON.stringify(JSON.parse(`{
                "terrascanConfig":${configJson},
                "iacMetadata": {
                    "iacType":"${iacType}",
                    "iacPath":"${getRelativePath(uri).split(path.sep).join(path.posix.sep)}",
                    "providerType":"${providerType}"
                }
            }`), null, "\t");

            let fileName = terrascanConfigName(parsedUri.fileName, "_terrascanConfig");
            let configUri = Utils.writeFile(configWrapper, fileName, constants.EXT_JSON, parsedUri.folderPath);
            workspace.openTextDocument(configUri).then(doc => {
                window.showTextDocument(doc);
            });
        } else {
            window.showInformationMessage(`No resource found of type ${iacType}`);
            LogUtils.logMessage(`No resource found of type ${iacType}`);
        }
    });
}

function terrascanConfigName(fileName: string, suffix: string): string {
    return fileName.replace(path.extname(fileName), "") + suffix;
}

function getRelativePath(uri: Uri): string {
    const root = workspace.getWorkspaceFolder(uri)?.uri.path || "";
    return uri.fsPath.replace(root + sep, "");
}
