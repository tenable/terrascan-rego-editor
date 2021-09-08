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
import { Utils } from './utils/utils';
import { generateRego } from './commands/generateRego';
import { generateConfigCommand as generateConfig } from "./commands/generateConfig";
import { LogUtils } from './logger/loggingHelper';
import { RegoLogger } from './logger/regoLogger';
import { scan } from "./commands/scan";
import { initializeStatusBarItem } from './utils/configuration';
import { syncCmd } from './commands/syncCommand';
import { MetadataCodeLensProvider } from './providers/metadataCodeLensProvider';
import { COMMAND_CONFIGURE, COMMAND_DOWNLOAD_POLICY, COMMAND_FETCH_ALL_CUSTOM_RULES, COMMAND_GENERATE_CONFIG, COMMAND_GENERATE_REGO, COMMAND_SCAN, COMMAND_SYNC } from './constants';
import { Policy, PolicyDataProvider } from "./providers/PolicyDataProvider";
import { downloadPolicy } from './commands/downloadPolicy';

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // initialize extension logger
    LogUtils.setLoggerObject(new RegoLogger(context));
    LogUtils.logMessage('rego-editor activated!');

    // initialize status bar item for configure command
    initializeStatusBarItem(COMMAND_CONFIGURE);

    if (!Utils.isTerrascanBinaryPresent(context)) {
        Utils.downloadTools(context);
    }

    let generateConfigCommand = vscode.commands.registerCommand(COMMAND_GENERATE_CONFIG, async (uri: vscode.Uri) => generateConfig(context, uri));

    let generateRegoCommand = vscode.commands.registerCommand(COMMAND_GENERATE_REGO, async (uri: vscode.Uri) => generateRego(context, uri));

    let scanCommand = vscode.commands.registerCommand(COMMAND_SCAN, async (uri: vscode.Uri) => scan(context, uri));

    let configureCommand = vscode.commands.registerCommand(COMMAND_CONFIGURE, () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:AccuricsInc.terrascan-rego-editor');
    });

    let syncCommand = vscode.commands.registerCommand(COMMAND_SYNC, async (uri: vscode.Uri) => syncCmd(uri, false));

    let downloadPolicyCommand = vscode.commands.registerCommand(COMMAND_DOWNLOAD_POLICY, async (policy: Policy) => downloadPolicy(policy));

    let fetchAllCommand = vscode.commands.registerCommand(COMMAND_FETCH_ALL_CUSTOM_RULES, async () => policyProvider.fetch());

    context.subscriptions.push(
        generateRegoCommand,
        generateConfigCommand,
        scanCommand,
        configureCommand,
        syncCommand,
        downloadPolicyCommand,
        fetchAllCommand
    );

    const medataCodeLensProvider: MetadataCodeLensProvider = new MetadataCodeLensProvider();
    vscode.languages.registerCodeLensProvider("json", medataCodeLensProvider);

    let policyProvider: PolicyDataProvider = new PolicyDataProvider(context);
    vscode.window.registerTreeDataProvider('regoeditor.views.policies', policyProvider);
}

// this method is called when the extension is deactivated
export function deactivate() { }
