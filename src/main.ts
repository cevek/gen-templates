import {statSync, readFileSync, writeFileSync, accessSync, mkdirSync} from "fs";
import {sep, dirname, join} from "path";
export const templateFolderName = 'gen-templates';

export function findGenTemplatesRoot() {
    const currDir = process.cwd();
    const parts = currDir.split(sep);

    for (var i = 0, len = parts.length; i < len; i++) {
        const dir = parts.join(sep) + sep;
        const dirName = dir + templateFolderName;
        let exists = false;
        try {exists = statSync(dirName).isDirectory()} catch (e) {}
        if (exists) {
            return dir;
        }
        parts.pop();
    }
    return null;
}

export function readFile(path:string) {
    const templateDirPath = findGenTemplatesRoot();
    return readFileSync(templateDirPath + path).toString();
}

export function isExist(path:string) {
    try {
        accessSync(path);
        return true;
    } catch (e) {
        return false
    }
}


function createDir(path:string) {
    try {
        mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}

function createNonExistentDirs(dirpath:string) {
    var parts = dirpath.split(sep);
    for (let i = 1; i <= parts.length; i++) {
        const dir = parts.slice(0, i).join(sep) || sep;
        if (!isExist(dir)) {
            createDir(dir);
        }
    }
}


export function writeFile(path:string, content:string, override?:boolean) {
    path = findGenTemplatesRoot() + path;
    createNonExistentDirs(dirname(path));
    if (isExist(path) && !override) {
        console.log(`File ${path} already exists`);
        return;
    }
    console.log(`create: ${path}`);
    writeFileSync(path, content);
}