import {statSync, readdirSync} from "fs";
import * as path from "path";
import {tests} from "../utils";


const args = process.argv;

const templateFolderName = 'gen-templates';

function findGenTemplates() {
    const currDir = process.cwd();
    const parts = currDir.split(path.sep);

    for (var i = 0, len = parts.length; i < len; i++) {
        const dirName = parts.join('/') + '/' + templateFolderName;
        let exists = false;
        try {exists = statSync(dirName).isDirectory()} catch (e) {}
        if (exists) {
            return dirName;
        }
        parts.pop();
    }
    return null;
}

function getCommands(dir:string) {
    return readdirSync(dir).filter(file => file.toLowerCase().substr(-3) == '.js').map(file => ({
        command: file.toLowerCase().substr(0, -3),
        file: dir + file,
    }));
}

const templateDirPath = findGenTemplates();
const commands = getCommands(templateDirPath);


console.log(templateDirPath);
tests();

