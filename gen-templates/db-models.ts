import {IGeneratorClass} from "../src/lib/igenerator-class";
import {parseDDL} from "../src/lib/ddl";
import {UpperCamelCase, lowerCamelCase} from "../src/lib/strings";
import {readFile} from "../src/lib/io";
export default class DbModels implements IGeneratorClass {
    help(){
        return `
            --doit Print all
            --well Hello
        `;
    }

    generator(args:{_:string[]}) {
        const file = readFile('betpub_2016-06-18.sql');
        const ddl = parseDDL(file);
        return [
            {
                filename: 'src/models/db.ts',
                content: `${ddl.map(table => `interface I${UpperCamelCase(table.table)}{\n${
                    table.fields.map(field =>`\t${lowerCamelCase(field.field)}: ${field.tsType}`).join('\n')
                    }\n}`).join('\n')}`,
            }
        ]
    }

}
