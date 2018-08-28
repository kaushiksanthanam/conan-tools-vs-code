import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync, exec } from 'child_process';
const File = require('File');

export class ConanDependenciesProvider implements vscode.TreeDataProvider<ConanDependency>
{
    onDidChangeTreeData?: vscode.Event<ConanDependency | null | undefined> | undefined;
    

    getTreeItem(element: ConanDependency): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ConanDependency | undefined): vscode.ProviderResult<ConanDependency[]> {
        throw new Error("Method not implemented.");
    }

    constructor(private workspace: string | undefined) {
       // 1. run conan info command
       // 2. collect the results into txt file
       // 3. Read and parse the text file
       // 4. Create the Conan Dependencies Tree Items
       let command = 'conan info ' + workspace + '/ --g=' + workspace + '/.conan_tools/conanInfo.dot';
       exec(command, (err, stdout, stderr) => {
           if(err){
               vscode.window.showErrorMessage("Failed to grab conan information. " + stderr.toString());
           }
           else{
               // Read from conanInfo.dot file
               fs.readFile(workspace + "/.conan_tools/conanInfo.dot", (err, data) => {
                   if(err){
                       vscode.window.showErrorMessage("Could not read conanInfo.dot");
                   }
                   else{
                       let fileContents = data.toString();
                       let lines = fileContents.split('\n');
                       
                       lines.forEach(line => {
                            let split = line.split("->");
                            if(split.length > 0) {
                                let parent = split[0];
                                let children = split[1];
                                vscode.window.showInformationMessage(parent.toString());
                            }
                       });
                   }
               });
           }
       });
       
    }

    private getConanDependencies(conanFilePath: string): void {
        exec('conan info .  -j > ./conan-tools/conanInstallInfo.txt', (error, stdout, stderr) => {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
        if (fs.exists('tmpConanOutput.txt', () => {
            //Readin txt file:
            const file = new File('tmpConanOutput.txt');
            let ret = Array<ConanDependency>();
            // TODO: TEST THIS METHOD
            // Read in input line by line
            // Line starts from \n then skip
            
            file.open('r');
            while (!file.eof) {
                // read each line of text
                const inputLine = file.readln();
                if(inputLine.charAt(0) === ' ') {
                    continue;
                }
                const firstWord = inputLine.split(' ')[0];
                if(firstWord === 'Downloading' || firstWord === 'Version') {
                    continue;
                }
                // Otherwise:
                const versionLibInfo = inputLine.split('/');
                const LibName = versionLibInfo[0];
                const versionInfo = versionLibInfo[1].split('@');
                const versionNumber = versionInfo[0];
                const channelInfo = versionInfo[1];
                const item = new ConanDependency(LibName, versionNumber, channelInfo, vscode.TreeItemCollapsibleState.None);
                ret.push(item);
            }
        })) {

        }
    }

}

class ConanDependency extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private version: string,
        public readonly channel: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}-${this.version}@${this.channel}`;
    }

    iconPath = path.join(__filename, '..', '..', '..', 'res', 'dependency.svg');
    contextValue = 'dependency';
}