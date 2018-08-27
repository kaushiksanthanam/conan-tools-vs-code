import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync, exec } from 'child_process';

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
        // exec('conan info .  -j > ./conan-tools/conanInstallInfo.txt', (error, stdout, stderr) => {
        //     console.log('stdout: ' + stdout);
        //     console.log('stderr: ' + stderr);
        //     if (error !== null) {
        //         console.log('exec error: ' + error);
        //     }
        // });
        // if (fs.exists('tmpConanOutput.txt', () => {
        //     //Readin txt file:
        //     const input = fs.createReadStream('tmpConanOutput.txt');
        //     let ret = Array<ConanDependency>();
        //     // TODO:
        //     // Read in input line by line
        //     // Line starts from \n then skip
        //     /*
        //     while (inputLine.length() >0 ) {
        //         if(inputLine.startWith('\n)) {
        //             skipThisLine();
        //         }
        //         if (inputLine.firstWord === 'Downloading') {
        //             skipThisLine();
        //         } 
        //         if (inputLine.firstWord === 'Version') {
        //             skipThisLine(); //Because it's not actual part.
        //         }
        //         versionLibInfo = inputLine.split('/');
        //         // Please match the dependency format.
        //         libItem = new ConanDependency(versionLibInfo[0],versionLibInfo[1],versionLibInfo[2]);
        //         ret.push(libItem);
        //     }
        //     */
            
        // })) {

        // }
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