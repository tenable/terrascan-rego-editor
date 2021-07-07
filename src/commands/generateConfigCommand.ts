import { ExtensionContext, window, OutputChannel, Uri , ProgressLocation} from "vscode";
import { Utils } from "../utils/utils";
import { TERRASCAN_IAC_TYPES, IAC_TYPE_QUICK_PICK_PLACEHOLDER, REGO_EDITOR_TOOLS_NOT_INSTALLED, INSTALL_OPTION, REGO_EDITOR_TOOLS_DOWNLOAD_FAILURE, REGO_EDITOR_TOOLS_DOWNLOAD_SUCCESS } from '../constants';
import { TerrascanDownloader } from '../downloader/terrascanDownloader';
import { sep } from "path";
import { v4 as uuidV4 } from "uuid";
import { exec } from "child_process";

export async function generateConfigCommand(context: ExtensionContext, uri: Uri) {

    // prompt for IAC type
    const iacType = await window.showQuickPick(TERRASCAN_IAC_TYPES, { placeHolder: IAC_TYPE_QUICK_PICK_PLACEHOLDER });
    if (iacType !== undefined) {
        window.withProgress({
            location: ProgressLocation.Window,
            cancellable: false,
            title: 'Generating Config'
        }, async (progress) => {
            progress.report({  increment: 0 });
            generateConfig(context, uri, iacType);
            progress.report({ increment: 100 });
        });
    } else {
        window.showErrorMessage('Config generation aborted!');
    }
}

// generate config json from iac files resources
async function generateConfig(context: ExtensionContext, uri: Uri, iacType: string) {
    console.log("Executing generateconfig command!");

    if (!Utils.isTerrascanBinaryPresent(context)) {
        let userAction = await window.showInformationMessage(REGO_EDITOR_TOOLS_NOT_INSTALLED, INSTALL_OPTION);
        if (userAction !== undefined) {
            try {
                await new TerrascanDownloader(context).downloadWithProgress(false);
                window.showInformationMessage(REGO_EDITOR_TOOLS_DOWNLOAD_SUCCESS);
            } catch (error: any) {
                window.showErrorMessage(REGO_EDITOR_TOOLS_DOWNLOAD_FAILURE + error.message);
                return;
            }
        }
    }

    const iacFilePath = uri.fsPath;

    let fileName = uuidV4().replace(/\-/g, "");
    let scanOptions = `-i ${iacType} -f ${iacFilePath} -o json --config-only`;

    let terrascanLocation: string = context.extensionPath + sep + 'executables' + sep + 'terrascan' + sep + 'terrascan';
    if (Utils.isWindowsPlatform()) {
        terrascanLocation += '.exe';
    }

    let accuricsOutputChannel: OutputChannel = window.createOutputChannel('rego-editor');
	accuricsOutputChannel.appendLine(`Running RegoEditor...`);
	accuricsOutputChannel.show();

    exec(`${terrascanLocation} scan ${scanOptions}`, (error, stdout, stderr) => {
        accuricsOutputChannel.appendLine(`CMD : ${terrascanLocation} scan ${scanOptions}`);
        let configJson:string = "";
        if (error) {
            if (error.code === 3) {
                window.setStatusBarMessage('Config generated!', 2000);
                accuricsOutputChannel.appendLine(`\nSuccess!`);
                configJson = stdout;
            } else {
                window.showErrorMessage('Config generation failed! Please check output tab for details');
                accuricsOutputChannel.appendLine(`ERROR : ${error}`);
                accuricsOutputChannel.appendLine(`ERROR : ${stderr}`);
                return;
            }
        } else {
            if (stderr) {
                window.showErrorMessage('Config generation failed! Please check output tab for details');
                accuricsOutputChannel.appendLine(`ERROR : ${stderr}`);
                return;
            }
            window.setStatusBarMessage('Config generated!', 2000);
            accuricsOutputChannel.appendLine(`\nSuccess!`);
            configJson = stdout;
        }
        if (configJson !== "") {
            Utils.saveAndOpen(configJson, fileName);
        }
    });
}