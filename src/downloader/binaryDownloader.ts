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

import decompress = require("decompress");
import { createWriteStream } from "fs";
import { arch, platform } from "os";
import { sep } from "path";
import { HttpClient } from "typed-rest-client/HttpClient";
import { ExtensionContext, Progress, ProgressLocation, ProgressOptions, window } from "vscode";
import { TerrascanRelease } from "../interface/terrascanMetadata";
import * as constants from '../constants';

//interface to define the type for vscode progress notification
export interface ProgressType {
    message?: string | undefined;
    increment?: number | undefined;
};

export abstract class BinaryDownloader {

    constructor(public context: ExtensionContext) { }

    // This method will download the dependency with a progress bar.
    downloadWithProgress() {
        let progressOptions: ProgressOptions = {
            location: ProgressLocation.Notification,
            title: constants.DOWNLOADING_REGO_EDITOR_TOOLS,
            cancellable: false
        };

        return window.withProgress(progressOptions, (progress) => {
            // progress report is hardcoded for now
            progress.report({ increment: 0 });
            return new Promise<boolean>((resolve, reject) => {
                this.downloadBinary(progress)
                    .then((downloadComplete: boolean) => {
                        progress.report({ increment: 100 });
                        resolve(downloadComplete);
                    })
                    .catch((reason: any) => {
                        reject(reason);
                    });
            });
        });
    }

    protected async download(extensionPath: string, browserDownloadUrl: string, githubResponse: TerrascanRelease): Promise<string> {
        let matchFound: boolean = false;

        if (githubResponse !== undefined) {
            for (let i = 0; i < githubResponse.assets.length; i++) {
                let assetName: string = githubResponse.assets[i].name.toLowerCase();
                if (assetName === "checksums.txt") {
                    continue;
                }

                switch (platform()) {
                    case "darwin":
                        matchFound = assetName.includes("darwin") && hasOSArch(assetName);
                        break;
                    case "win32":
                        matchFound = assetName.includes("windows") && hasOSArch(assetName);
                        break;
                    case "linux":
                        matchFound = assetName.includes("linux") && hasOSArch(assetName);
                        break;
                    default:
                        throw new Error(`Terrascan doesn't support ${platform()}`);
                }

                if (matchFound) {
                    browserDownloadUrl = githubResponse.assets[i].browser_download_url;
                    break;
                }
            }
        }

        if (browserDownloadUrl.trim().length === 0) {
            throw new Error(`counldn't download terrascan ${githubResponse.tag_name}`);
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

    abstract downloadBinary(progress: Progress<ProgressType>): Promise<boolean>;

    async extractTarFile(downloadedFilePath: string, binaryFolderName: string) {
        return decompress(downloadedFilePath, this.context.extensionPath + sep + 'executables' + sep + binaryFolderName, {
            map: file => {
                return file;
            }
        });
    }
}

function hasOSArch(assetName: string): boolean {
    // terrascan supports x86_64, arm64, i386 architectures
    switch (arch()) {
        case "arm64":
            if (assetName.includes("arm64")) {
                return true;
            }
            break;
        case "x64":
            if (assetName.includes("x86_64")) {
                return true;
            }
            break;
        case "x32":
        case "ia32":
            if (assetName.includes("i386")) {
                return true;
            }
    }
    return false;
}
