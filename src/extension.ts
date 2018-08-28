'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


import { ConanDependenciesProvider } from './conanDependencies';
import { exec } from 'child_process';
import { ProgressLocation } from 'vscode';

let rootPath:string | undefined;
let buildPath:string;
let conan_tmpFolder:string;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    rootPath = vscode.workspace.rootPath;
    buildPath = rootPath + '/build';
    conan_tmpFolder = rootPath + '/.conan_tools';

    if(!fs.existsSync(conan_tmpFolder)){
        fs.mkdirSync(conan_tmpFolder);
    }
    const conanDependencyProvider = new ConanDependenciesProvider(rootPath);

    vscode.commands.registerCommand('conan.install', () => {
        
        vscode.window.withProgress({
            location:ProgressLocation.Notification,
            title: "Conan Tools"
        }, (progress, token) => {
            let p = new Promise(resolve => {
                progress.report({message: "Installing conan dependencies" });
                setImmediate(() => {
                    
                    // Create build directory if non existent
                    if(!fs.existsSync(buildPath))
                    {
                        fs.mkdirSync(vscode.workspace.rootPath + '/build/');
                    }

                    exec('conan install ..', {cwd: buildPath, maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
                        if(err)
                        {
                            progress.report({message: "Install Failed"});
                            vscode.window.showErrorMessage("Install Failed");

                            vscode.window.showErrorMessage("Conan Tools: Installing dependencies failed");
                            fs.writeFileSync(conan_tmpFolder + "/install.log", stdout.toString());
                            
                            let installLogUri = vscode.Uri.file(conan_tmpFolder + "/install.log");
                            vscode.window.showTextDocument(installLogUri);

                        } else {
                            vscode.window.showInformationMessage('Conan Tools: Installed conan dependencies');
                            conanDependencyProvider.refresh();
                        }
                        resolve();
                    });
                });
            });
            return p;
        });
        

    });

    vscode.commands.registerCommand('conan.build', () => {
        
        vscode.window.withProgress({
            location:ProgressLocation.Notification,
            title: "Conan Tools"    
        }, (progress, token) => {
            progress.report({message: "Building" });
            let p = new Promise(resolve => {
                setImmediate(() => {

                    if(!fs.existsSync(buildPath))
                    {
                        fs.mkdirSync(vscode.workspace.rootPath + '/build/');
                    }
                    
                    exec('conan build ..', {cwd: buildPath, maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
                        if(err){
                            progress.report({message: "Build Failed"});      
                            vscode.window.showErrorMessage("Conan Tools: Build failed");
                            fs.writeFileSync(conan_tmpFolder + "/build.log", stdout.toString());
                            
                            let buildLogUri = vscode.Uri.file(conan_tmpFolder + "/build.log");
                            vscode.window.showTextDocument(buildLogUri, {viewColumn: vscode.ViewColumn.Beside});
                        } else {
                            progress.report({message: "Build completed"});
                            vscode.window.showInformationMessage("Conan Tools: Build succeeded");
                        }
                        resolve();
                    });

                });
            });
            return p;
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}