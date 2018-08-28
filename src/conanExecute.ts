
export class ConanExecute {
    private exec = require('child_process').exec;
    private fs = require('fs');

    constructor(){}

    conanExec(command: string) {
        this.exec(command, (error: Error, stdout: string | Buffer, stderr: string | Buffer) => {
            if (error) {
                const errorLog = 'Name: ' + error.name + '\nMessage: ' + error.message + '\nStack: ' + error.stack;
                this.fs.writeFile('errorLog.txt', errorLog, (err: Error) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("error File created");
                });
                console.log(errorLog);
            } else {
                this.fs.writeFile('conanLog.txt', stdout, (err: Error) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("conanLog File created");
                });
                console.log(stdout);
            }
        });
    }

    conanInstall() {
        this.conanExec('conan install ..');
    }

    conanBuild() {
        this.conanExec('conan build ..');
    }
}