import decompress = require("decompress");
import { createWriteStream } from "fs";
import { arch, platform } from "os";
import { sep } from "path";
import { HttpClient } from "typed-rest-client/HttpClient";
import { ExtensionContext, Progress, ProgressLocation, ProgressOptions, window } from "vscode";
import { LatestReleaseResponse } from "../interface/terrascanMetadata";
import { Utils } from "../utils/utils";

//interface to define the type for vscode progress notification
export interface ProgressType {
    message?: string | undefined;
    increment?: number | undefined;
};

export abstract class BinaryDownloader {

    constructor(public context: ExtensionContext) { }

    // This method will download the dependency with a progress bar.
    downloadWithProgress(isActivateCall: boolean) {
        let progressOptions: ProgressOptions = {
            location: ProgressLocation.Notification,
            title: 'Downloading Accurics tools',
            cancellable: false
        };

        return window.withProgress(progressOptions, (progress) => {
            
            // progress report is hardcoded for now
            progress.report({ increment: 0 });
            return new Promise<boolean>((resolve, reject) => {
                this.downloadBinary(progress, isActivateCall)
                    .then((downloadComplete: boolean) => {
                        // console.log('dependencies downloaded');
                        progress.report({ increment: 100 });
                        resolve(downloadComplete);
                    })
                    .catch((reason: any) => {
                        // console.log('terrascan download failed');
                        reject(reason);
                    });
            });
        });
    }

    protected async download(extensionPath: string, browserDownloadUrl: string, githubResponse?: LatestReleaseResponse): Promise<string> {

        if (githubResponse !== undefined) {
            for (let i = 0; i < githubResponse.assets.length; i++) {
                let assetName: string = githubResponse.assets[i].name.toLowerCase();

                let currentPlatform: string = platform();
                if (Utils.isWindowsPlatform()) {
                    currentPlatform = 'windows';
                }

                //contains os name and correct arch
                if (assetName.includes(currentPlatform) && assetName.includes(arch().substring(1))) {
                    browserDownloadUrl = githubResponse.assets[i].browser_download_url;
                    break;
                }
            }
        }

        let client = new HttpClient("terrascan-regoEditor");
        let response = await client.get(browserDownloadUrl);
        let downloadTarFileName: string = browserDownloadUrl.substring(browserDownloadUrl.lastIndexOf('/') + 1);
        let filePath = extensionPath + sep + 'executables' + sep + downloadTarFileName;
        let file: NodeJS.WritableStream = createWriteStream(filePath);

        if (response.message.statusCode !== 200) {
            const err: Error = new Error(`Unexpected HTTP response: ${response.message.statusCode}`);
            throw err;
        }
        return new Promise((resolve, reject) => {
            file.on("error", (err) => reject(err));
            const stream = response.message.pipe(file);
            stream.on("close", () => {
                try {
                    resolve(filePath);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    abstract downloadBinary(progress: Progress<ProgressType>, isActivateCall: boolean): Promise<boolean>;

    async extractTarFile(downloadedFilePath: string, binaryFolderName: string) {
        return decompress(downloadedFilePath, this.context.extensionPath + sep + 'executables' + sep + binaryFolderName, {
            map: file => {
                return file;
            }
        });
    }
}