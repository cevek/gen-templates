"use strict";

import {readdirSync, readFileSync} from "fs";
import {GeneratorClass} from "../GeneratorFunction";
import {findGenTemplatesRoot, templateFolderName, writeFile} from "./main";
import {tests} from "../utils";

const args = process.argv;

function getCommands(dir:string) {
    return readdirSync(dir).filter(file => file.toLowerCase().substr(-3) == '.js').reduce((obj, file) => {
        const filename = file.toLowerCase();
        obj[filename.substr(0, filename.length - 3)] = dir + file;
        return obj;
    }, {} as {[n:string]:string});
}


const templateDirPath = findGenTemplatesRoot();
const commands = getCommands(templateDirPath + templateFolderName + '/');


const commandName = args[2];
const commandFile = commands[commandName];
console.log(commands);

if (commandFile) {
    console.log(commandFile);
    const GenClass = require(commandFile).default as any;
    const generatorClass:GeneratorClass = new GenClass();
    const result = generatorClass.generator();
    for (let i = 0; i < result.length; i++) {
        const res = result[i];
        writeFile(res.filename, res.content, true);
    }
    console.log(`Done. Created files: ${result.length}`);

}
else {
    console.log(`Command not found: ${commandName}`);
}

console.log(templateDirPath);
// tests();

