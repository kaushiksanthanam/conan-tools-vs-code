import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import exec from 'child_process';
import * from 'lazy';

export class ConanDependenciesProvider implements vscode.TreeDataProvider<ConanDependency>
{
    onDidChangeTreeData?: vscode.Event<ConanDependency | null | undefined> | undefined;
    private conanFileFromPython;

    getTreeItem(element: ConanDependency): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }

    getChildren(element?: ConanDependency | undefined): vscode.ProviderResult<ConanDependency[]> {
        throw new Error("Method not implemented.");
    }

    constructor(private workspace: string | undefined) {
        this.getConanDependencies('~/Desktop/HackKey/conan-tools-vs-code/conanfile.py')
    }

    private getConanDependencies(conanFilePath: string): ConanDependency[] {
        exec('conan info .  -j > tmpConanOutput.txt', (error, stdout, stderr) => {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
        if (fs.exists('tmpConanOutput.txt', () => {
            //Readin txt file:
            const input = fs.createReadStream('tmpConanOutput.txt');
            let ret = Array<ConanDependency>();
            // TODO:
            // Read in input line by line
            // Line starts from \n then skip
            /*
            while (inputLine.length() >0 ) {
                if(inputLine.startWith('\n)) {
                    skipThisLine();
                }
                if (inputLine.firstWord === 'Downloading') {
                    skipThisLine();
                } 
                if (inputLine.firstWord === 'Version') {
                    skipThisLine(); //Because it's not actual part.
                }
                versionLibInfo = inputLine.split('/');
                // Please match the dependency format.
                libItem = new ConanDependency(versionLibInfo[0],versionLibInfo[1],versionLibInfo[2]);
                ret.push(libItem);
            }
            */
            
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