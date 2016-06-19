"use strict";
import {IGeneratorClass} from "./lib/igenerator-class";
import {println, printlnError, findGenTemplatesRoot, templateFolderName, writeFile, getCommands} from "./lib/io";
import {UpperCamelCase, trimLines} from "./lib/strings";

var argv:Arguments = require('minimist')(process.argv.slice(2), {string: true});

const templateDirPath = findGenTemplatesRoot();
const commands = getCommands(templateDirPath + templateFolderName + '/');

if (argv.help || argv.h) {
    println(`
        -h, --help - Output this help
        --new name create new generator file
    `);

} else if (argv.new) {
    if (typeof argv.new !== 'string' || !argv.new.match(/^[\w\d_\-.$]+$/)) {
        printlnError(`${argv.new} is not valid command name`);
    }
    const content = `
        import {GeneratorClass} from "../GeneratorFunction";
        import {UpperCamelCase, lowerCamelCase, trimLines} from "../utils";
        export default class ${UpperCamelCase(argv.new)} implements GeneratorClass {
            help(){
                return \`
                    Creates something good
                \`;
            }
            
            generator(args:{_:string[], optional:boolean}) {
                const name = args._[0];
                if (!name) {
                    throw new Error("name is required");
                }
                const cls = UpperCamelCase(name);
                const lowerCase = lowerCamelCase(name);
                const optional = args.optional;
                return [
                    {
                        filename: \`src/models/\${cls}.ts\`,
                        content: trimLines(\`
                            export class \${cls} {
                                foo\${optional ? '?' : ''}: string;
                            }
                            const \${lowerCase} = new \${cls}();
                        \`)
                    }
                ]
            }
        }
        `;
    writeFile(templateFolderName + '/' + argv.new + '.ts', trimLines(content), argv.o);

} else {
    const commandName = argv._.shift();
    const commandFile = commands[commandName];
    if (commandFile) {
        console.log(commandFile);
        const GenClass = require(commandFile).default as any;
        const generatorClass:IGeneratorClass = new GenClass();
        const result = generatorClass.generator(argv);
        for (let i = 0; i < result.length; i++) {
            const res = result[i];
            writeFile(res.filename, res.content, argv.o);
        }
    }
    else {
        println(`Command not found: ${commandName}`);
    }
}

