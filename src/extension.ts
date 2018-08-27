'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


import { ConanDependenciesProvider } from './conanDependencies';
import { execSync, exec } from 'child_process';
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
                progress.report({message: "Installing" });
                setImmediate(() => {
                    
                    // Create build directory if non existent
                    if(!fs.existsSync(buildPath))
                    {
                        fs.mkdirSync(vscode.workspace.rootPath + '/build/');
                    }

                    exec('conan install ..', {cwd: buildPath}, (err, stdout, stderr) => {
                        if(err)
                        {
                            progress.report({message: "Install Failed. " + stderr.toString()});
                            vscode.window.showErrorMessage(stderr.toString());
                        } else {
                            vscode.window.showInformationMessage('Conan Tools: Installed conan dependencies');
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
                    
                    exec('conan build ..', {cwd: buildPath}, (err, stdout, stderr) => {
                        if(err){
                            progress.report({message: "Build Failed. " + err.stack});
                            vscode.window.showErrorMessage(err.stack ? err.stack.toString(): "Build Failed");
                        } else {
                            progress.report({message: "Build completed"});
                            vscode.window.showInformationMessage("Conan Tools: Build completed");
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