/**
 * This interface is used to parse the response
 * received from github related to a particular 
 * release of a repo. It will hold the list of 
 * assets present in a particular release of a 
 * repository.
 */
 export interface LatestReleaseResponse {
    url: string,
    assets_url: string,
    tag_name: string,
    assets: RepoReleaseAssets[]
}

interface RepoReleaseAssets {
    url: string,
    name: string,
    content_type: string,
    browser_download_url: string   
}