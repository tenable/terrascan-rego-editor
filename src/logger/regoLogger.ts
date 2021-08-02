import { OutputChannel, ExtensionContext, window } from 'vscode';

export class RegoLogger {
    private regoEditorLogsChannel: OutputChannel;
    constructor(private context: ExtensionContext) {
        this.regoEditorLogsChannel = window.createOutputChannel('RegoEditorLogs');
        this.context.subscriptions.push(this.regoEditorLogsChannel);
    }

    log(logMessage: string) {
        this.regoEditorLogsChannel.appendLine(new Date().toUTCString() + ': ' + logMessage);
    }
}