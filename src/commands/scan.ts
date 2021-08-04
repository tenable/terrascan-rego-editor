
import * as vscode from 'vscode';
import { Utils } from "../utils/utils";
import { sep } from "path";
import { exec } from "child_process";
import path = require("path");
import { IacMetadata } from '../interface/terrascanMetadata';
import { LogUtils } from "../logger/loggingHelper";
import stripAnsi = require('strip-ansi');
import * as constants from "../constants";
import { TerrascanDownloader } from '../downloader/terrascanDownloader';


const iacTypePrefix = "#IAC_TYPE:";
const iacPathPrefix = "#IAC_PATH:";

export async function scan(context: vscode.ExtensionContext, uri: vscode.Uri) {

    LogUtils.logMessage("Executing 'Scan' command!");

    if (!Utils.isTerrascanBinaryPresent(context)) {
        let userAction = await vscode.window.showInformationMessage(constants.REGO_EDITOR_TOOLS_NOT_INSTALLED, constants.INSTALL_OPTION);
        if (userAction !== undefined) {
            try {
                await new TerrascanDownloader(context).downloadWithProgress();
                vscode.window.showInformationMessage(constants.REGO_EDITOR_TOOLS_DOWNLOAD_SUCCESS);
            } catch (error: any) {
                vscode.window.showErrorMessage(constants.REGO_EDITOR_TOOLS_DOWNLOAD_FAILURE + error.message);
                return;
            }
        }
    }

    let workspace = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath || "";

    let contents = await vscode.workspace.fs.readFile(uri);
    let regoContent = contents.toString();

    let pathMatch = regoContent.match(new RegExp(`${iacPathPrefix}([a-zA-Z0-9\-\\/.]*)`, "g"));
    let typeMatch = regoContent.match(new RegExp(`${iacTypePrefix}\\w+`, "g"));

    if (!pathMatch || !typeMatch) {
        LogUtils.logMessage("ERROR: No Iac Metadata found in Policy file!");
        vscode.window.showErrorMessage('No Iac Metadata found in Policy file!');
        return;
    }

    let iacMetadata: IacMetadata = {
        iacPath: pathMatch[0].replace(iacPathPrefix, ""),
        iacType: typeMatch[0].replace(iacTypePrefix, "")
    };

    const parsedUri = Utils.parseUri(uri);
    let iacAbsolutePath = path.join(workspace, iacMetadata.iacPath);
    let scanOptions = `-i ${iacMetadata.iacType} -f ${iacAbsolutePath} -p ${parsedUri.folderPath} -o json --scan-rules="${parsedUri.fileName.replace(".rego", "")}"`;

    let terrascanLocation: string = context.extensionPath + sep + 'executables' + sep + 'terrascan' + sep + 'terrascan';
    if (Utils.isWindowsPlatform()) {
        terrascanLocation += '.exe';
    }

    let regoEditorOC: vscode.OutputChannel = vscode.window.createOutputChannel('RegoEditor');
    regoEditorOC.show();

    exec(`${terrascanLocation} scan ${scanOptions}`, (error, stdout, stderr) => {
        LogUtils.logMessage(`CMD : terrascan scan ${scanOptions}`);
        let response: string = "";

        // if process exits with error or with violations
        if (!!error) {
            if (error.code === 3) {
                // scan exited with violations
                LogUtils.logMessage("Scan succesful with violations!");
                vscode.window.showErrorMessage('Scan succesful with violations!');
                response = stdout;
            } else {
                // scan exited with error
                LogUtils.logMessage(`ERROR : ${error}`);
                vscode.window.showErrorMessage('Scan failed! Please check RegoEditorLogs output channel for details');

                if (stderr && stderr.trim()) {
                    LogUtils.logMessage(`ERROR : ${stripAnsi(stderr)}`);
                }
                return;
            }
        } else {
            if (stderr) {
                vscode.window.showErrorMessage('Scan completed with errors');
                LogUtils.logMessage(`ERROR : ${stripAnsi(stderr)}`);
            } else {
                vscode.window.setStatusBarMessage('Scan succesful!', 2000);
                LogUtils.logMessage(`Scan completed successful!`);
            }
            response = stdout;
        }
        if (response !== "") {
            regoEditorOC.appendLine(response);
        }
    });

}