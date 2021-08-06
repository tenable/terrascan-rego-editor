import { CancellationToken, CodeLens, CodeLensProvider, Command, Range, TextDocument } from 'vscode';

export class ScanCodeLensProvider implements CodeLensProvider {
    public provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
        const blocks: CodeLens[] = [];
       
        
        const range = new Range(1, 0, 2, 0);
            const cmd: Command = {
                arguments: [document, range],
                title: 'Send Request',
                command: 'rest-client.request'
            };
            blocks.push(new CodeLens(range, cmd));

        return Promise.resolve(blocks);
    }
}