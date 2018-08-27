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
    
}