import { RuleResponse } from "../interface/backendMetadata";
import * as regoEditorConfig from "../utils/configuration";
import { BackendClient } from "./backendClient";

export async function fetchAllCustomRules(): Promise<RuleResponse | undefined | void> {

    if (!regoEditorConfig.isBackendConfigValid()) {
        return;
    }

    let targetEnv: string = regoEditorConfig.getTargetEnv();
    let appToken: string = regoEditorConfig.getApplicationToken();

    let backendClient: BackendClient = new BackendClient(targetEnv, appToken);
    return backendClient.getRules();
}