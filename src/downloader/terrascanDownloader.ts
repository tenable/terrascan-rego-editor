import { request, RequestOptions } from "https";
import { ExtensionContext, Progress } from "vscode";
import { TerrascanRelease } from "../interface/terrascanMetadata";
import { unlinkSync } from "fs";
import decompress = require('decompress');
import { BinaryDownloader, ProgressType } from "./binaryDownloader";
import { TERRASCAN_VERSION } from "../constants";

export class TerrascanDownloader extends BinaryDownloader {

    private downloadedFilePath: string = '';

    private host: string = 'api.github.com';
    private path: string = '/repos/accurics/terrascan/releases';


    constructor(public context: ExtensionContext) {
        super(context);
    }

    downloadBinary(progress: Progress<ProgressType>): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.getTerrascanReleaseData(progress)
                .then((terrascanReleases: TerrascanRelease[]) => {
                    return new Promise<TerrascanRelease>((resolve, reject) => {
                        terrascanReleases.forEach(release => {
                            if (release.tag_name === TERRASCAN_VERSION) {
                                resolve(release);
                            }
                        });
                        reject(new Error(`Terrascan release ${TERRASCAN_VERSION} not found`));
                    });
                })
                .then((latestReleaseResponse: TerrascanRelease) => {
                    return this.download(this.context.extensionPath, '', latestReleaseResponse);
                })
                .then((downloadedFilePath) => {
                    this.downloadedFilePath = downloadedFilePath;
                    progress.report({ increment: 60 });
                    return this.extractTarFile(downloadedFilePath, 'terrascan');
                })
                .then((files: decompress.File[]) => {
                    // delete the downloaded tar file
                    unlinkSync(this.downloadedFilePath);
                    resolve(true);
                })
                .catch((reason: any) => {
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