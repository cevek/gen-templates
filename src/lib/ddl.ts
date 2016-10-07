const types:{[type:string]:string} = {
    tinyint: 'number',
    smallint: 'number',
    mediumint: 'number',
    int: 'number',
    bigint: 'number',
    float: 'number',
    double: 'number',
    decimal: 'number',

    timestamp: 'number',
    date: 'Date',
    datetime: 'Date',
    time: 'string',
    year: 'number',

    varchar: 'string',
    char: 'string',
    tinyblob: 'string',
    blob: 'string',
    text: 'string',
    mediumblob: 'string',
    mediumtext: 'string',
    longblob: 'string',
    longtext: 'string',
    enum: 'string[]',
    set: 'string[]',
    json: 'any'
};

export interface DDLTable {
    table:string;
    fields:DDLTableField[]
}

interface DDLTableField {
    field:string;
    type:string;
    size:number;
    tsType:string;
    notNull:boolean;
    primary?:boolean;
    unsigned?:boolean;
    autoIncrement?:boolean;
    defaultValue?:string;
    generated?:boolean;
}
export function parseDDL(text:string):DDLTable[] {
    text = text.replace(/--.*$/gm, '');
    text = text.replace(/#.*$/gm, '');
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    const queries = text.replace(/[\n\r]/g, '').split(';');
    const tables:DDLTable[] = [];
    for (let i = 0; i < queries.length; i++) {
        var query = queries[i];

        const m = query.match(/CREATE TABLE\s*`(.*?)`\s*\((.*)\)/i);
        if (m) {
            const table = m[1];
            const fields = m[2].split(',');
            const normFields:DDLTableField[] = [];
            const fieldsMap:{[name:string]:DDLTableField} = {};
            for (let j = 0; j < fields.length; j++) {
                const fieldStr = fields[j].trim();
                const f = fieldStr.match(/^`(\w+)`\s*(\w+)(\((\d+)\))?/i);
                if (f) {
                    const type = f[2].toLowerCase();
                    const size = +f[4];
                    let tsType = types[type];
                    if (size === 1 && type == 'tinyint') {
                        tsType = 'boolean';
                    }
                    if (!tsType) {
                        throw new Error('type is not recognized: ' + f[2]);
                    }
                    const field:DDLTableField = {
                        field: f[1],
                        type: type,
                        size: size,
                        tsType: tsType,
                        notNull: !!fieldStr.match(/ NOT NULL/i)
                    };
                    if (fieldStr.match(/ unsigned/i)) {
                        field.unsigned = true;
                    }
                    if (fieldStr.match(/ AUTO_INCREMENT/i)) {
                        field.autoIncrement = true;
                    }
                    if (fieldStr.match(/ GENERATED/i)) {
                        field.generated = true;
                    }
                    const defaultValMatch = fieldStr.match(/ DEFAULT '(.*?)'/);
                    if (defaultValMatch) {
                        field.defaultValue = defaultValMatch[1];
                    }
                    fieldsMap[field.field] = field;
                    normFields.push(field);
                }
                const pkMatch = fieldStr.match(/^PRIMARY KEY \(`(.*?)`\)/);
                if (pkMatch) {
                    fieldsMap[pkMatch[1]].primary = true;
                }

                const uniqueMatch = fieldStr.match(/^UNIQUE KEY `.*?` \((.*?)\)/);
                if (uniqueMatch) {
                    //todo:
                }
            }
            tables.push({table: table, fields: normFields});
        }
    }
    return tables;
}


// export function tests() {
//
//     function assertEqual<T>(result:T, expect:T) {
//         for (const prop in expect) {
//             if (expect.hasOwnProperty(prop)) {
//                 const val = (result as any)[prop];
//                 const expectVal = (expect as any)[prop];
//                 if (val && typeof val == 'object') {
//                     assertEqual(val, expectVal);
//                 } else {
//                     if (expectVal !== val) {
//                         console.log(`Test failed, result: \n${JSON.stringify(result, null, 2)}; \nexpect: \n${JSON.stringify(expect, null, 2)} `);
//                         return;
//                     }
//                 }
//             }
//         }
//         console.log('Test success');
//     }
//
//
//     assertEqual(parseDDL(`
// CREATE TABLE \`state\` (
//   \`id\` int(11) unsigned NULL AUTO_INCREMENT,
//   -- \`country_id\` int(11) unsigned NOT NULL,
//   # \`country_id2\` int(11) unsigned NOT NULL,
//   /* \`country_id3\` int(11) unsigned NOT NULL,*/
//   \`name\` varchar(255) NOT NULL,
//   \`abbreviation\` varchar(255) NOT NULL,
//   \`is_enabled\` tinyint(1) zerofill DEFAULT '1',
//   PRIMARY KEY (\`id\`)
// ) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8;
// `), [{
//         table: 'state',
//         fields: [
//             {
//                 field: 'id',
//                 type: 'int',
//                 size: 11,
//                 tsType: 'number',
//                 unsigned: true,
//                 notNull: false,
//                 primary: true,
//                 autoIncrement: true
//             },
//             {field: 'name', size: 255, type: 'varchar', tsType: 'string', notNull: true},
//             {field: 'abbreviation', size: 255, type: 'varchar', tsType: 'string', notNull: true},
//             {field: 'is_enabled', type: 'tinyint', size: 1, tsType: 'boolean', notNull: false, defaultValue: '1'}
//         ]
//     }]);
// }