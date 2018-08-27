import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ConanDependenciesProvider implements vscode.TreeDataProvider<ConanDependency>
{
    onDidChangeTreeData?: vscode.Event<ConanDependency | null | undefined> | undefined;    
    
    getTreeItem(element: ConanDependency): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }

    getChildren(element?: ConanDependency | undefined): vscode.ProviderResult<ConanDependency[]> {
        throw new Error("Method not implemented.");
    }

    constructor(private workspace: string | undefined){
        
    }

}

class ConanDependency extends vscode.TreeItem
{
    constructor(
        public readonly label: string,
        private version: string,
        public readonly channel: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    )
    {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}-${this.version}@${this.channel}`;
    }

    iconPath = path.join(__filename, '..', '..', '..', 'res', 'dependency.svg');
    contextValue = 'dependency';
}