import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

let conanToolsFolderPath: string | undefined;
let conanToolsInfoFilePath: string;

export class ConanDependenciesProvider implements vscode.TreeDataProvider<ConanDependency>
{

    private _onDidChangeTreeData: vscode.EventEmitter<ConanDependency | undefined> = new vscode.EventEmitter<ConanDependency | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<ConanDependency | undefined | null> = this._onDidChangeTreeData.event;


    getTreeItem(element: ConanDependency): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ConanDependency): vscode.ProviderResult<ConanDependency[]> {
        let ret: ConanDependency[] | undefined = [];
        let children: string[] | undefined;
        if (element === undefined) {
            children = this.dependencies.get('ROOT');
        } else {
            children = this.dependencies.get(element.label);
        }
        return new Promise((resolve, rejected) => {
            if(children) {
                children.forEach(child => {
                    let childDependency: ConanDependency;
                    if(this.dependencies.has(child))
                    {
                        childDependency = new ConanDependency(child, vscode.TreeItemCollapsibleState.Collapsed);
                    }
                    else {
                        childDependency = new ConanDependency(child, vscode.TreeItemCollapsibleState.None);
                    }
                    if(ret) {
                        ret.push(childDependency);
                    }                    
                });
            }
            resolve(ret);
        });
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    constructor(private workspace: string | undefined, private dependencies: Map<string, string[]> = new Map()) {

        conanToolsFolderPath = workspace + '/.vscode/.conan_tools';
        conanToolsInfoFilePath = conanToolsFolderPath + '/conanInfo.dot';
        if(fs.existsSync(conanToolsInfoFilePath)) {
            this.readConanInfo();

        } else {
            this.createConanInfo();
        }
        this.refresh();
    }

    createConanInfo() {
        let command = 'conan info ' + this.workspace + '/ --g=' + conanToolsInfoFilePath;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage('Failed to grab conan information');
                exec('conan install .', { cwd: this.workspace, maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                    vscode.window.showErrorMessage('Conan Tools: Failed to get conan info');
                    fs.writeFileSync(conanToolsFolderPath + '/info.log', stdout.toString());

                    let infoLogUri = vscode.Uri.file(conanToolsFolderPath + '/info.log');
                    vscode.window.showTextDocument(infoLogUri);
                });
            }
            else {
                this.readConanInfo();
            }
        });
    }

    readConanInfo() {
        let dataBuffer = fs.readFileSync(conanToolsInfoFilePath);
        let fileContents = dataBuffer.toString();
        let lines = fileContents.split('\n');

        lines.forEach(line => {
            if (!(line.startsWith("}")) && !(line.startsWith('digraph'))) {
                let split = line.split("->");
                if (split.length > 0) {
                    let parentLabel = split[0];
                    parentLabel = parentLabel.replace("\"", "").trim();
                    parentLabel = parentLabel.replace(/"/g, '');
                    if (parentLabel.includes('@PROJECT')) {
                        parentLabel = 'ROOT';
                    }
                    
                    let childrenConan: string[] = [];
                    let children = split[1];
                    if(children) {
                        children = children.replace('{', '');
                        children = children.replace('}', '');
                        children = children.replace(/"/g, '');
                        let cleanChildren = children.split(' ');
                        cleanChildren.forEach(cleanChild => {
                            if (cleanChild !== '' && cleanChild !== ' ') {
                                let childLabel = cleanChild.trim();
                                childrenConan.push(childLabel);
                            }
                        });
                        if(childrenConan.length > 0) {                      
                            this.dependencies.set(parentLabel, childrenConan);
                        }
                    }
                }
            }
        });  


        // fs.readFile(conanToolsInfoFilePath, (err, data) => {
        //     if (err) {
        //         vscode.window.showErrorMessage('Could not read conanInfo.dot');
        //     }
        //     else {
        //         let fileContents = data.toString();
        //         let lines = fileContents.split('\n');

        //         lines.forEach(line => {
        //             if (!(line.startsWith("}")) && !(line.startsWith('digraph'))) {
        //                 let split = line.split("->");
        //                 if (split.length > 0) {
        //                     let parentLabel = split[0];
        //                     parentLabel = parentLabel.replace("\"", "").trim();
        //                     parentLabel = parentLabel.replace(/"/g, '');
        //                     if (parentLabel.includes('@PROJECT')) {
        //                         parentLabel = 'ROOT';
        //                     }
                            
        //                     let childrenConan: string[] = [];
        //                     let children = split[1];
        //                     children = children.replace('{', '');
        //                     children = children.replace('}', '');
        //                     children = children.replace(/"/g, '');
        //                     let cleanChildren = children.split(' ');
        //                     cleanChildren.forEach(cleanChild => {
        //                         if (cleanChild !== '' && cleanChild !== ' ') {
        //                             let childLabel = cleanChild.trim();
        //                             childrenConan.push(childLabel);
        //                         }
        //                     });
        //                     if(childrenConan.length > 0) {                      
        //                         this.dependencies.set(parentLabel, childrenConan);
        //                     }
        //                 }
        //             }
        //         });               
        //     }
        //     this.refresh();
        // });
    }
}


class ConanDependency extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}`;
    }

    iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.png'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.png')
	};

    contextValue = 'dependency';
}