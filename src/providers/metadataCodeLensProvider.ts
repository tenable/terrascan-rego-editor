import { CancellationToken, CodeLens, CodeLensProvider, TextDocument, Command, TextLine } from "vscode";
import { COMMAND_SYNC } from "../constants";
import { MetadataJSON } from "../interface/terrascanMetadata";

export class MetadataCodeLensProvider implements CodeLensProvider {

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        const blocks: CodeLens[] = [];
        const text = document.getText();

        if (this.parseJSON(text)) {
            for (let i = 0; i < document.lineCount; i++) {
                if (document.lineAt(i).isEmptyOrWhitespace) {
                    continue;
                }
                let line: TextLine = document.lineAt(i);
                if (line.text.charAt(line.firstNonWhitespaceCharacterIndex) === "{") {
                    let command: Command = {
                        title: "Sync",
                        tooltip: "Sync rule to Accurics backend",
                        command: COMMAND_SYNC,
                        arguments: [document.uri]
                    };
                    blocks.push(new CodeLens(line.range, command));
                    break;
                }
            }
        }
        return Promise.resolve(blocks);
    }

    private parseJSON(data: string): boolean {
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
}