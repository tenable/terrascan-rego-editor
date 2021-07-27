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

export type AllResourceConfig = Record<string, ResourceConfig[]>;