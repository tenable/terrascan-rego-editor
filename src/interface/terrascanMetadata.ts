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
    iacPath: string
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
    template_args: {
        name: string,
        prefix: string,
        suffix: string
    },
    severity: string,
    description: string,
    reference_id: string,
    category: string,
    version: string,
    id: string
};