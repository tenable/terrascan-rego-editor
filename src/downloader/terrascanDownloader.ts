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

import { request, RequestOptions } from "https";
import { ExtensionContext, Progress } from "vscode";
import { TerrascanRelease } from "../interface/terrascanMetadata";
import { unlinkSync } from "fs";
import decompress = require('decompress');
import { BinaryDownloader, ProgressType } from "./binaryDownloader";
import { TERRASCAN_VERSION } from "../constants";
import { LogUtils } from "../logger/loggingHelper";

export class TerrascanDownloader extends BinaryDownloader {

    private downloadedFilePath: string = '';

    private host: string = 'api.github.com';
    private path: string = '/repos/tenable/terrascan/releases';


    constructor(public context: ExtensionContext) {
        super(context);
    }

    downloadBinary(progress: Progress<ProgressType>): Promise<boolean> {
        LogUtils.logMessage(`downloading terrascan ${TERRASCAN_VERSION}`);
        return new Promise<boolean>((resolve, reject) => {
            this.getTerrascanReleaseData(progress)
                .then((terrascanReleases: TerrascanRelease[]) => {
                    return new Promise<TerrascanRelease>((resolve, reject) => {
                        terrascanReleases.forEach(release => {
                            if (release.tag_name === TERRASCAN_VERSION) {
                                LogUtils.logMessage(`terrascan release ${TERRASCAN_VERSION} found`);
                                resolve(release);
                            }
                        });
                        let errMessage: string = `terrascan release ${TERRASCAN_VERSION} not found`;
                        LogUtils.logMessage(errMessage);
                        reject(new Error(errMessage));
                    });
                })
                .then((latestReleaseResponse: TerrascanRelease) => {
                    return this.download(this.context.extensionPath, '', latestReleaseResponse);
                })
                .then((downloadedFilePath) => {
                    this.downloadedFilePath = downloadedFilePath;
                    progress.report({ increment: 60 });
                    LogUtils.logMessage(`extracting ${downloadedFilePath}`);
                    return this.extractTarFile(downloadedFilePath, 'terrascan');
                })
                .then((files: decompress.File[]) => {
                    // delete the downloaded tar file
                    unlinkSync(this.downloadedFilePath);
                    resolve(true);
                })
                .catch((reason: any) => {
                    LogUtils.logMessage(`terrascan ${TERRASCAN_VERSION} download failed`);
                    reject(reason);
                });
        });
    }

    private async getTerrascanReleaseData(progress: Progress<ProgressType>): Promise<TerrascanRelease[]> {

        return new Promise<TerrascanRelease[]>((resolve, reject) => {
            let options: RequestOptions = {
                host: this.host,
                port: 443,
                path: this.path,
                method: 'GET',
                headers: {
                    'User-Agent': 'terrascan-rego-editor'
                }
            };

            let req = request(options, (res) => {
                let data: string = '';
                res.on('data', (d) => {
                    data += String(d);
                });
                res.on('end', () => {
                    let jsonData = <TerrascanRelease[]>JSON.parse(data);
                    progress.report({ increment: 10 });
                    resolve(jsonData);
                });
            });
            req.end();
            req.on('error', reject);
        });
    }
}
