import * as vscode from "vscode";
import { AllResourceConfig, ResourceConfig } from '../interface/terrascanMetadata';
import { VariableType, RegoVariable } from '../interface/regoElement';
import * as constants from '../constants';
import { Utils } from "../utils/utils";
import * as os from "os";


export async function generateRego(context: vscode.ExtensionContext, uri: vscode.Uri) {

    let editor = vscode.window.activeTextEditor;

    if (uri === undefined && editor === undefined) {
        vscode.window.showErrorMessage("select file");
    } else {
        let content: string = "";
        let isSelection: boolean = false;

        if (uri && editor) {
            if (uri.fsPath === editor.document.uri.fsPath && !editor.selection.isEmpty) {
                content = editor.document.getText(editor.selection);
                isSelection = true;
            } else {
                let contents = await vscode.workspace.fs.readFile(uri);
                content = contents.toString();
            }
        } else if (uri) {
            let contents = await vscode.workspace.fs.readFile(uri);
            content = contents.toString();
        } else if (editor) {
            uri = editor.document.uri;
            if (!editor.selection.isEmpty) {
                content = editor.document.getText(editor.selection);
                isSelection = true;
            } else {
                content = editor.document.getText();
            }
        }

        let output: Map<string, RegoVariable> = new Map();
        output = parseFileContents(content, isSelection);

        if (output.size !== 0) {
            await generatePolicyFiles(uri, context,output);
            if (context.globalState.get("showRegoHelperTemplatePrompt", true)) {
                regoHelperTemplatePrompt(context);
            }
        }
    }
}

function parseFileContents(content: string, isSelection: boolean): Map<string, RegoVariable> {
    let resourceTypes: Map<string, RegoVariable> = new Map();
    if (isSelection) {
        try {
            let allResConfig: ResourceConfig = JSON.parse(content);
            let resourceConfig: ResourceConfig = allResConfig;
            if (typeof resourceConfig !== "object") {
                vscode.window.showErrorMessage("selected text is not a Terrascan standardized config json object");
                return resourceTypes;
            }
            if (!!resourceConfig.config) {
                let regoElem = new RegoVariable("config", VariableType.object, true, null);
                addObjectElements(regoElem, resourceConfig.config);
                resourceTypes.set(resourceConfig.type, regoElem);
            }
        } catch (e) {
            vscode.window.showErrorMessage(e.message);
            return resourceTypes;
        }
    } else {
        let allResConfig: AllResourceConfig = JSON.parse(content);
        if (allResConfig) {
            console.log(allResConfig);
            Object.entries(allResConfig).forEach((value) => {
                console.log(value[0]);
                let resourceConfigList = value[1];
                if (resourceConfigList.length > 0) {
                    // for now, pick only the first element in the resource list
                    // later we can club together the config object from each resource config
                    let resourceConfig: ResourceConfig = resourceConfigList[0];
                    if (typeof resourceConfig !== "object") {
                        vscode.window.showErrorMessage("selected file is not a Terrascan standardized json file");
                        return resourceTypes;
                    }
                    if (!!resourceConfig.config) {
                        let regoElem = new RegoVariable("config", VariableType.object, true, null);
                        addObjectElements(regoElem, resourceConfig.config);
                        resourceTypes.set(value[0], regoElem);
                    }
                }
            });

        } else {
            vscode.window.showErrorMessage("selected file is not a Terrascan standardized json file");
        }
    }

    return resourceTypes;
}

function buildRegoOutput(input: Map<string, RegoVariable>,context:vscode.ExtensionContext): string {
    let output: string = `package accurics\n\n`;
    if (context.globalState.get("showRegoHelperTemplate", true)) {
        output += `${constants.REGO_HELPER_TEMPLATE}\n\n`;
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

    return metaDataTemplate;
}

async function regoHelperTemplatePrompt(context:vscode.ExtensionContext) {
    let userAction = await vscode.window.showInformationMessage(constants.REGO_HELPER_TEMPLATE_PROMPT, constants.DO_NOT_PROMPT_OPTION, constants.DISABLE_OPTION);
    
    if (userAction === constants.DO_NOT_PROMPT_OPTION) {
        context.globalState.update("showRegoHelperTemplatePrompt", false);
    } else if (userAction === constants.DISABLE_OPTION) {
        context.globalState.update("showRegoHelperTemplate", false);
        context.globalState.update("showRegoHelperTemplatePrompt", false);
    }
}

async function generatePolicyFiles(uri:vscode.Uri, context:vscode.ExtensionContext,data:Map<string, RegoVariable>) {
    const parsedUri = Utils.parseUri(uri);

            const resourceType = data.keys().next().value;
            const provider = "PROVIDER";
            let counter = context.globalState.get("policySuffixCounter", 1);
            context.globalState.update("policySuffixCounter", counter + 1);

            const fileName = `${os.userInfo().username.toUpperCase()}_${provider}_${Utils.leftFillNum(counter)}`;
            let regoFileUri = Utils.writeFile(buildRegoOutput(data, context), fileName, constants.EXT_REGO, parsedUri.folderPath);

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
