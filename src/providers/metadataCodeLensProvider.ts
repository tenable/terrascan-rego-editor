import { CancellationToken, CodeLens, CodeLensProvider, TextDocument, Command, TextLine } from "vscode";
import { COMMAND_SYNC } from "../constants";
import { isValidMetadataJSON, MetadataJSON } from "../interface/terrascanMetadata";

export class MetadataCodeLensProvider implements CodeLensProvider {

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        const blocks: CodeLens[] = [];
        const text = document.getText();

        if (isValidMetadataJSON(text)) {
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
}