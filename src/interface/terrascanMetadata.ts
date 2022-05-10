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

/**
 * This interface is used to parse the response
 * received from github related to a particular
 * release of a repo. It will hold the list of
 * assets present in a particular release of a
 * repository.
 */
export interface TerrascanRelease {
    url: string,
    assets_url: string,
    tag_name: string,
    assets: ReleaseAssets[]
}

interface ReleaseAssets {
    url: string,
    name: string,
    content_type: string,
    browser_download_url: string
}

// ResourceConfig represents individual resource config
// object present in the standardized json
export interface ResourceConfig {
    id: string,
    name: string,
    source: string,
    type: string,
    config: any
}

export type IacMetadata = {
    iacType: string,
    iacPath: string,
    providerType?: string
};

export type AllResourceConfig = Record<string, ResourceConfig[]>;

export interface ResourceConfigWrapper {
    terrascanConfig: AllResourceConfig,
    iacMetadata: IacMetadata
}

// MetadataJSON represents policy metadata of terrascan
export interface MetadataJSON {
    name: string,
    file: string,
    policy_type: string,
    resource_type: string,
    template_args: TemplateArg,
    severity: string,
    description: string,
    reference_id: string,
    category: string,
    version: number,
    id: string
};

export type TemplateArg = {
    name: string,
    prefix: string,
    suffix: string
};

export function isValidMetadataJSON(data: string): boolean {
    try {
        let obj = <MetadataJSON>JSON.parse(data);
        if (obj.name && typeof obj.name === "string" &&
            obj.file && typeof obj.file === "string" &&
            obj.policy_type && typeof obj.policy_type === "string" &&
            obj.resource_type && typeof obj.resource_type === "string" &&
            obj.template_args && typeof obj.template_args === "object" &&
            obj.severity && typeof obj.severity === "string" &&
            obj.version && typeof obj.version === "number" &&
            obj.id && typeof obj.id === "string") {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
};
