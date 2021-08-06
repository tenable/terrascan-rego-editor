import * as vscode from "vscode";
import { AllResourceConfig, ResourceConfig, ResourceConfigWrapper, IacMetadata } from '../interface/terrascanMetadata';
import { VariableType, RegoVariable } from '../interface/regoElement';
import * as constants from '../constants';
import { Utils } from "../utils/utils";
import * as os from "os";
import { LogUtils } from "../logger/loggingHelper";
import * as regoEditorConfig from "../utils/configuration";


export async function generateRego(context: vscode.ExtensionContext, uri: vscode.Uri) {
    LogUtils.logMessage("Executing 'Generate Rego' command!");
    let editor = vscode.window.activeTextEditor;

    if (uri === undefined && editor === undefined) {
        vscode.window.showErrorMessage("select file");
    } else {
        let fileContent: string = "";
        let selectedContent: string = "";

        // Identify if the user has selected any specific resource config object
        if (uri && editor) {
            if (uri.fsPath === editor.document.uri.fsPath && !editor.selection.isEmpty) {
                selectedContent = editor.document.getText(editor.selection);
            }
        } else if (editor) {
            uri = editor.document.uri;
            if (!editor.selection.isEmpty) {
                selectedContent = editor.document.getText(editor.selection);
            }
        }

        // file content has two purpose, provide the standard config json if user do not select a 
        // specific config object. and provide the iacMetadata
        let contents = await vscode.workspace.fs.readFile(uri);
        fileContent = contents.toString();

        let configWrapper = {} as ResourceConfigWrapper;
        try {
            configWrapper = JSON.parse(fileContent);
        } catch (e) {
            LogUtils.logMessage(`error parsing config, ${e.message}`);
            vscode.window.showErrorMessage(e.message);
            return;
        }

        let isValid: boolean = validateConfig(configWrapper);
        if (!isValid) {
            vscode.window.showErrorMessage("selected file is not a RegoEditor generated config file!");
            LogUtils.logMessage("selected file is not a RegoEditor generated config file!");
            return;
        }

        let allResConfig: AllResourceConfig = configWrapper.terrascanConfig;

        let output: Map<string, RegoVariable> = new Map();
        if (selectedContent !== "") {
            try {
                let specificConfig: ResourceConfig = JSON.parse(selectedContent);
                output = parseFileContents(allResConfig, specificConfig);
            } catch (e) {
                LogUtils.logMessage(`error parsing selected resource, ${e.message}`);
                vscode.window.showErrorMessage(e.message);
                return;
            }
        } else {
            output = parseFileContents(allResConfig);
        }

        if (output.size !== 0) {
            await generatePolicyFiles(uri, context, output, configWrapper.iacMetadata);
            LogUtils.logMessage("rego generation successful");

            if (context.globalState.get("showRegoHelperTemplatePrompt", true) && regoEditorConfig.getShowHelperTemplate()) {
                regoHelperTemplatePrompt(context);
            }
        }
    }
}

function parseFileContents(allResConfig: AllResourceConfig, selectedResConfig?: ResourceConfig): Map<string, RegoVariable> {
    let resourceTypes: Map<string, RegoVariable> = new Map();
    if (!!selectedResConfig) {
        updateResourceTypeMap(selectedResConfig, resourceTypes);
    } else {
        Object.entries(allResConfig).forEach((value) => {
            let resourceConfigList = value[1];
            if (resourceConfigList.length > 0) {
                // for now, pick only the first element in the resource list
                // later we can club together the config object from each resource config
                let resourceConfig: ResourceConfig = resourceConfigList[0];
                updateResourceTypeMap(resourceConfig, resourceTypes);
            }
        });
    }
    return resourceTypes;
}

function updateResourceTypeMap(resourceConfig: ResourceConfig, resourceTypes: Map<string, RegoVariable>) {
    if (typeof resourceConfig !== "object") {
        vscode.window.showErrorMessage("selected json is not a Terrascan standardized config json object");
        return resourceTypes;
    }
    if (!!resourceConfig.config) {
        let regoElem = new RegoVariable("config", VariableType.object, true, null);
        addObjectElements(regoElem, resourceConfig.config);
        resourceTypes.set(resourceConfig.type, regoElem);
    }
}

function buildRegoOutput(input: Map<string, RegoVariable>, context: vscode.ExtensionContext, uri: vscode.Uri, iacMetadata: IacMetadata): string {
    let output: string = `package accurics\n\n`;
    if (regoEditorConfig.getShowHelperTemplate()) {
        output += `${constants.REGO_HELPER_TEMPLATE}\n\n`;
    }

    if (!!iacMetadata) {
        output += `#IAC_TYPE:${iacMetadata.iacType}\n#IAC_PATH:${iacMetadata.iacPath}\n\n`;
    }
    output += `# This is an example for a Rego rule. The value inside the brackets [array.id] is returned if the rule evaluates to be true.\n# This rule will return the 'id' of every document in 'array' that has 'authorization' key set to "NONE"\n\n`;

    input.forEach((regoElement, resourceType) => {
        output += `{{.prefix}}{{.name}}{{.suffix}}[array.id] {\n`;
        output += `\t# array := input.${resourceType}[_]\n`;

        regoElement.children.forEach((elem) => {
            output += `\t# array.config.${elem.name} == ${Utils.defaultVal(elem.type)}\n`;
        });
        output += "\n}\n";
    });
    return output;
}

function addObjectElements(parent: RegoVariable, obj: any): void {
    if (obj) {
        Object.keys(obj).forEach(key => {
            let value = obj[key];
            addElements(parent, key, value);
        });
    }
}

function addArrayElements(parent: RegoVariable, arr: any[]): void {
    if (arr) {
        arr.forEach((value, i) => {
            addElements(parent, i.toString(), value);
        });
    }
}

function addElements(parent: RegoVariable, key: string, value: any): void {
    let childElem: RegoVariable;
    if (Array.isArray(value)) {
        childElem = new RegoVariable(key, VariableType.array, false, parent);
        addArrayElements(childElem, value);
        parent.addChild(childElem);
    } else if (typeof value === "object") {
        childElem = new RegoVariable(key, VariableType.object, false, parent);
        addObjectElements(childElem, value);
        parent.addChild(childElem);
    } else if (typeof value === "string") {
        childElem = new RegoVariable(key, VariableType.string, false, parent);
        parent.addChild(childElem);
    } else if (typeof value === "number") {
        childElem = new RegoVariable(key, VariableType.number, false, parent);
        parent.addChild(childElem);
    } else if (typeof value === "boolean") {
        childElem = new RegoVariable(key, VariableType.boolean, false, parent);
        parent.addChild(childElem);
    }
}

function buildMetaDataOutput(regoPath: string = "", policyType: string = "", resourceType: string = "", id: string = ""): string {
    let metaDataTemplate = `{
        "name": "policyName",
        "file": "${regoPath}",
        "policy_type": "${policyType}",
        "resource_type": "${resourceType}",
        "template_args": {
            "name":"policyName",
            "prefix": "",
            "suffix": ""
        },
        "severity": "LOW",
        "description": "",
        "category": "",
        "version":1,
        "id": "${id}"
    }`;

    return JSON.stringify(JSON.parse(metaDataTemplate), null, "\t");
}

async function regoHelperTemplatePrompt(context: vscode.ExtensionContext) {
    let userAction = await vscode.window.showInformationMessage(constants.REGO_HELPER_TEMPLATE_PROMPT, constants.DO_NOT_PROMPT_OPTION, constants.DISABLE_OPTION);

    if (userAction === constants.DO_NOT_PROMPT_OPTION) {
        context.globalState.update("showRegoHelperTemplatePrompt", false);
    } else if (userAction === constants.DISABLE_OPTION) {
        regoEditorConfig.setShowHelperTemplate(false);
    }
}

async function generatePolicyFiles(uri: vscode.Uri, context: vscode.ExtensionContext, data: Map<string, RegoVariable>, iacMetadata: IacMetadata) {
    const parsedUri = Utils.parseUri(uri);

    const resourceType = data.keys().next().value;
    const provider = "PROVIDER";

    let counter: number = regoEditorConfig.getPolicySuffixCounter();
    regoEditorConfig.setPolicySuffixCounter(counter + 1);

    const fileName = `${os.userInfo().username.toUpperCase()}_${provider}_${Utils.leftFillNum(counter)}`;
    let regoFileUri = Utils.writeFile(buildRegoOutput(data, context, uri, iacMetadata), fileName, constants.EXT_REGO, parsedUri.folderPath);

    vscode.workspace.openTextDocument(regoFileUri).then(doc => {
        vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside
        });
    });

    let metaFileUri = Utils.writeFile(buildMetaDataOutput(fileName + constants.EXT_REGO, provider, resourceType, fileName), fileName, constants.EXT_JSON, parsedUri.folderPath);

    vscode.workspace.openTextDocument(metaFileUri).then(doc => {
        vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside
        });
    });
}
function validateConfig(configWrapper: ResourceConfigWrapper): boolean {
    if (configWrapper.terrascanConfig
        && configWrapper.iacMetadata
        && configWrapper.iacMetadata.iacPath
        && configWrapper.iacMetadata.iacPath.trim()
        && configWrapper.iacMetadata.iacType
        && configWrapper.iacMetadata.iacType.trim()
    ) {
        return true;
    } else {
        return false;
    }

}

