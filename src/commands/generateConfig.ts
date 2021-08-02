import { ExtensionContext, window, OutputChannel, Uri, ProgressLocation, workspace } from "vscode";
import { Utils } from "../utils/utils";
import * as constants from '../constants';
import { TerrascanDownloader } from '../downloader/terrascanDownloader';
import { sep } from "path";
import { exec } from "child_process";
import * as path from "path";
import { LogUtils } from "../logger/loggingHelper";


export async function generateConfigCommand(context: ExtensionContext, uri: Uri) {

    // prompt for IAC type
    const iacType = await window.showQuickPick(constants.TERRASCAN_IAC_TYPES, { placeHolder: constants.IAC_TYPE_QUICK_PICK_PLACEHOLDER });
    if (iacType !== undefined) {
        window.withProgress({
            location: ProgressLocation.Window,
            cancellable: false,
            title: 'Generating Config'
        }, async (progress) => {
            progress.report({ increment: 0 });
            generateConfig(context, uri, iacType);
            progress.report({ increment: 100 });
        });
    } else {
        window.showErrorMessage('Config generation aborted!');
    }
}

// generate config json from iac files resources
async function generateConfig(context: ExtensionContext, uri: Uri, iacType: string) {
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
        if (error) {
            if (error.code === 1) {
                window.setStatusBarMessage('Config generated!', 2000);
                LogUtils.logMessage("config generation successful");
                configJson = stdout;
            } else {
                window.showErrorMessage('Config generation failed! Please check output tab for details');
                LogUtils.logMessage(`ERROR : ${error}`);
                LogUtils.logMessage(`ERROR : ${stderr}`);
                return;
            }
        } else {
            if (stderr) {
                window.showErrorMessage('Config generation failed! Please check output tab for details');
                LogUtils.logMessage(`ERROR : ${stderr}`);
                return;
            }
            window.setStatusBarMessage('Config generated!', 2000);
            LogUtils.logMessage("config generation successful");
            configJson = stdout;
        }
        if (configJson !== "") {
            let fileName = terrascanConfigName(parsedUri.fileName, "_terrascanConfig");
            let uri = Utils.writeFile(configJson, fileName, constants.EXT_JSON, parsedUri.folderPath);
            workspace.openTextDocument(uri).then(doc => {
                window.showTextDocument(doc);
            });
        }
    });
}

function terrascanConfigName(fileName: string, suffix: string): string {
    return fileName.replace(path.extname(fileName), "") + suffix;
}