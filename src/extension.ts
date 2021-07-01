import * as vscode from 'vscode';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	
	console.log('extension active');

	let generateConfigCommand = vscode.commands.registerCommand('regoeditor.generateConfig', () => {
		vscode.window.showInformationMessage('Command not implemented !!');
	});
	context.subscriptions.push(generateConfigCommand);

	let generateRegoCommand = vscode.commands.registerCommand('regoeditor.generateRego', () => {
		vscode.window.showInformationMessage('Command not implemented !!');
	});
	context.subscriptions.push(generateRegoCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
