import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';


export class ConanDependenciesProvider implements vscode.TreeDataProvider<ConanDependency>
{

    private _onDidChangeTreeData: vscode.EventEmitter<ConanDependency | undefined> = new vscode.EventEmitter<ConanDependency | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<ConanDependency | undefined | null> = this._onDidChangeTreeData.event;


    getTreeItem(element: ConanDependency): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ConanDependency): vscode.ProviderResult<ConanDependency[]> {
        let ret: ConanDependency[];
        if (element === undefined) {
            this.dependencies.forEach(dep => {
                if (dep.parent.label.includes('@PROJECT')) {
                    ret = dep.children;
                }
            });
        } else {
            this.dependencies.forEach(dep => {
                if (dep.parent.label === element.label) {
                    ret = dep.children;
                }
            });
        }
        return new Promise((resolve, rejected) => {
            resolve(ret);
        });
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    constructor(private workspace: string | undefined, private dependencies: Dependency[] = []) {
        // 1. run conan info command
        // 2. collect the results into txt file
        // 3. Read and parse the text file
        // 4. Create the Conan Dependencies Tree Items
        let command = 'conan info ' + this.workspace + '/ --g=' + this.workspace + '/.conan_tools/conanInfo.dot';
        exec(command, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage("Failed to grab conan information");
                exec('conan install .', { cwd: this.workspace, maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                    vscode.window.showErrorMessage("Conan Tools: Failed to get conan info");
                    fs.writeFileSync(this.workspace + "/.conan_tools/info.log", stdout.toString());

                    let infoLogUri = vscode.Uri.file(this.workspace + "/.conan_tools/info.log");
                    vscode.window.showTextDocument(infoLogUri);
                });
            }
            else {
                // Read from conanInfo.dot file
                fs.readFile(this.workspace + "/.conan_tools/conanInfo.dot", (err, data) => {
                    if (err) {
                        vscode.window.showErrorMessage("Could not read conanInfo.dot");
                    }
                    else {
                        let fileContents = data.toString();
                        let lines = fileContents.split('\n');

                        lines.forEach(line => {
                            if (!(line.startsWith("}")) && !(line.startsWith('digraph'))) {
                                let split = line.split("->");
                                if (split.length > 0) {
                                    let parentLabel = split[0];
                                    parentLabel = parentLabel.replace("\"", "").trim();
                                    parentLabel = parentLabel.replace(/"/g, '');
                                    let parentConan = new ConanDependency(parentLabel, vscode.TreeItemCollapsibleState.Collapsed);

                                    let childrenConan: ConanDependency[] = [];
                                    let children = split[1];
                                    children = children.replace('{', '');
                                    children = children.replace('}', '');
                                    children = children.replace(/"/g, '');
                                    let cleanChildren = children.split(' ');
                                    cleanChildren.forEach(cleanChild => {
                                        if (cleanChild !== '' && cleanChild !== ' ') {
                                            let childLabel = cleanChild.trim();
                                            let cleanChildConan = new ConanDependency(childLabel, vscode.TreeItemCollapsibleState.Collapsed);
                                            childrenConan.push(cleanChildConan);
                                        }
                                    });

                                    let dependency = new Dependency(parentConan, childrenConan);
                                    this.dependencies.push(dependency);
                                    this.refresh();
                                }
                            }
                        });
                    }
                });
            }
        });

    }
}

class Dependency {
    constructor(public readonly parent: ConanDependency,
        public readonly children: ConanDependency[]) {

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

    iconPath = vscode.workspace.rootPath + '/res/dependency.svg';
    contextValue = 'dependency';
}