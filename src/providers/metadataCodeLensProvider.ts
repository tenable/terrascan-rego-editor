/*
    Copyright (C) 2021 Accurics, Inc.
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
                        arguments: [document.uri, true]
                    };
                    blocks.push(new CodeLens(line.range, command));
                    break;
                }
            }
        }
        return Promise.resolve(blocks);
    }
}
