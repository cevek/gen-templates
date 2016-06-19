import {statSync, readFileSync, writeFileSync, accessSync, mkdirSync} from "fs";
import {sep, dirname} from "path";
import {trimLines} from "./strings";
import {readdirSync} from "fs";
export const templateFolderName = 'gen-templates';

export function println(str:string) {
    console.log(trimLines(str));
}

export function printlnError(str:string) {
    console.error(trimLines(str));
}

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

export function createNonExistentDirs(dirpath:string) {
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
        println(`File ${path} already exists`);
        return;
    }
    println(`Create file: ${path}`);
    writeFileSync(path, content);
}

export function getCommands(dir:string) {
    return readdirSync(dir).filter(file => file.toLowerCase().substr(-3) == '.js').reduce((obj, file) => {
        const filename = file.toLowerCase();
        obj[filename.substr(0, filename.length - 3)] = dir + file;
        return obj;
    }, {} as {[n:string]:string});
}