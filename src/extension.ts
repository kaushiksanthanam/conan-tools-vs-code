'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ConanDependenciesProvider } from './conanDependencies';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const rootPath = vscode.workspace.rootPath;
    const conanDependencyProvider = new ConanDependenciesProvider(rootPath);

    vscode.window.registerTreeDataProvider('conan.install', conanDependencyProvider);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    vscode.commands.registerCommand('conan.install', () => {
        vscode.window.showInformationMessage('Conan install completed');
    });
    
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}