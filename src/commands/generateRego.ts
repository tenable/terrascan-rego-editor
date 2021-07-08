import * as vscode from "vscode";
import { AllResourceConfig, ResourceConfig } from '../interface/terrascanMetadata';
import { VariableType, RegoVariable } from '../interface/regoElement';

export async function generateRego(uri: vscode.Uri) {

    let editor = vscode.window.activeTextEditor;
    console.log("editor", editor!.document.uri);
    console.log("uri", uri);
    if (uri === undefined && editor === undefined) {
        vscode.window.showErrorMessage("select file");
    } else {
        let content: string = "";
        let output: Map<string, RegoVariable> = new Map();
        if (uri) {
            let contents = await vscode.workspace.fs.readFile(uri);
            content = contents.toString();
            output = parseFileContents(content);
        } else if (editor) {
            content = editor.document.getText();
            output = parseFileContents(content);
        }

        if (output.size !== 0) {
            let doc = await vscode.workspace.openTextDocument({
                language: "rego",
                content: buildRegoOutput(output)
            });
            vscode.window.showTextDocument(doc);
        }
    }
}

function parseFileContents(content: string): Map<string, RegoVariable> {
    let resourceTypes: Map<string, RegoVariable> = new Map();
    let allResConfig: AllResourceConfig = JSON.parse(content);
    if (allResConfig) {
        // console.log(allResConfig);
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
                if (resourceConfig.config !== null) {
                    let regoElem = new RegoVariable("config", VariableType.object, true, null);
                    addObjectElements(regoElem, resourceConfig.config);
                    resourceTypes.set(value[0], regoElem);
                }
            }
        });
    } else {
        vscode.window.showErrorMessage("selected file is not a Terrascan standardized json file");
    }
    return resourceTypes;
}

function buildRegoOutput(input: Map<string, RegoVariable>): string {
    let output: string = "package accurics\n\n";
    input.forEach((regoElement, resourceType) => {
        output += `${resourceType}[api.id] {\n`;
        output += `\tapi := input.${resourceType}[_]\n`;
        output += `\tconfig := api.config\n`;

        regoElement.childs.forEach((elem, i) => {
            let varName: string = "var" + i.toString();
            if (elem.type === VariableType.array) {
                output += `\t${varName} := config.${elem.name}[_]\n`;
            } else {
                output += `\t${varName} := config.${elem.name}\n`;
            }
            if (elem.childs.length > 0) {
                elem.childs.forEach((child, j) => {
                    output += buildChildsLines(child, varName, j.toString(), varName);
                });
            }
        });
        output += "\n}\n";
    });
    return output;
}

function buildChildsLines(vairable: RegoVariable, variablePrefix: string, variableSuffix: string, valuePrefix: string): string {
    let output: string = "";
    let varName: string = variablePrefix + "_" + variableSuffix;

    if (vairable.type === VariableType.array) {
        output += `\t#${varName} := ${valuePrefix}.${vairable.name}[_]\n`;
    } else {
        output += `\t#${varName} := ${valuePrefix}.${vairable.name}\n`;
    }

    if (vairable.childs.length > 0) {
        vairable.childs.forEach((elem, i) => {
            output += buildChildsLines(elem, varName, i.toString(), varName);
        });
    }
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