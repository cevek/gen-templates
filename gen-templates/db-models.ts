import {GeneratorClass} from "../GeneratorFunction";
import {parseDDL, UpperCamelCase, lowerCamelCase} from "../utils";
import {readFile} from "../src/main";
export default class DbModels implements GeneratorClass {
    generator() {
        const file = readFile('betpub_2016-06-18.sql');
        const ddl = parseDDL(file);
        return [
            {
                filename: 'src/models/db.ts',
                content: `${ddl.map(table => `interface I${UpperCamelCase(table.table)}{\n${table.fields.map(field => `\t${lowerCamelCase(field.field)}: ${field.tsType}`).join('\n')}\n}`).join('\n')}`,
            }
        ]
    }

}
