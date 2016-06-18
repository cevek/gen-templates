const plural = require('pluralize');

export function UpperCamelCase(name:string) {
    const parts = getWords(name);
    if (parts.length == 0) {
        return '';
    }
    return parts.map(UpperCase).join('');
}

export function UpperCase(word:string) {
    return word.substr(0, 1).toUpperCase() + word.substr(1);
}

export function lowerCase(word:string) {
    return word.substr(0, 1).toLowerCase() + word.substr(1);
}

export function lowerCamelCase(name:string) {
    let parts = getWords(name);
    if (parts.length == 0) {
        return '';
    }
    let firstWord = parts.shift();
    parts = parts.map(UpperCase);
    if (!isAbbr(firstWord)) {
        firstWord = lowerCase(firstWord);
    }
    parts.unshift(firstWord);
    return parts.join('');
}

export function snake_case(name:string) {
    const parts = getWords(name);
    if (parts.length == 0) {
        return '';
    }
    return parts.map(word => isAbbr(word) ? word : lowerCase(word)).join('_');
}

export function kebab_case(name:string) {
    const parts = getWords(name);
    if (parts.length == 0) {
        return '';
    }
    return parts.map(word => isAbbr(word) ? word : lowerCase(word)).join('-');
}

export function pluralizeLastWord(name:string) {
    const parts = getWords(name);
    if (parts.length == 0) {
        return name;
    }
    const lastWord = parts.pop();
    const lastPos = name.lastIndexOf(lastWord);

    return name.substr(0, lastPos) + plural(lastWord) + name.substr(lastPos + lastWord.length);
}
export function singularizeLastWord(name:string) {
    const parts = getWords(name);
    if (parts.length == 0) {
        return name;
    }
    const lastWord = parts.pop();
    const lastPos = name.lastIndexOf(lastWord);

    return name.substr(0, lastPos) + plural.singular(lastWord) + name.substr(lastPos + lastWord.length);
}

function strToMap(str:string) {
    const map:{[i:string]:boolean} = {};
    for (var i = 0; i < str.length; i++) {
        map[str[i]] = true;
    }
    return map;
}
const upperLetters = strToMap('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const lowerLetters = strToMap('abcdefghijklmnopqrstuvwxyz1234567890');

export function isAbbr(word:string) {
    for (var i = 0; i < word.length; i++) {
        if (!upperLetters[word[i]]) {
            return false;
        }
    }
    return true;
}

export function getWords(str:string):string[] {
    const words:string[] = [];
    let prevIsUpper = false;
    let prevIsLower = false;
    let start = 0;
    if (str) {
        for (var i = 0; i <= str.length; i++) {
            var letter = str[i];
            if (upperLetters[letter]) {
                if (prevIsLower) {
                    if (start < i) {
                        words.push(str.substring(start, i));
                    }
                }
                if (prevIsLower || !prevIsUpper) {
                    start = i;
                }
                prevIsUpper = true;
                prevIsLower = false;
            }
            else if (lowerLetters[letter]) {
                if (!prevIsLower && !prevIsUpper) {
                    start = i;
                }
                if (prevIsUpper) {
                    if (start < i - 1) {
                        words.push(str.substring(start, i - 1));
                    }
                    start = i - 1;
                }
                prevIsUpper = false;
                prevIsLower = true;
            }
            else {
                if (prevIsLower || prevIsUpper) {
                    if (start < i) {
                        words.push(str.substring(start, i));
                    }
                    start = i;
                }
                prevIsLower = false;
                prevIsUpper = false;
            }
        }
    }
    return words;
}


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
}

interface DDLTable {
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
export function parseDDL(text:string) {
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


export function tests() {

    function assert(result:string | string[], expect:string) {
        if (result instanceof Array) {
            result = (result as string[]).join(', ');
        }
        if (result !== expect) {
            console.log(`Test failed, result: ${result}; expect: ${expect}`);
        } else {
            console.log('Test success');
        }
    }

    function assertEqual<T>(result:T, expect:T) {
        for (const prop in expect) {
            if (expect.hasOwnProperty(prop)) {
                const val = (result as any)[prop];
                const expectVal = (expect as any)[prop];
                if (val && typeof val == 'object') {
                    assertEqual(val, expectVal);
                } else {
                    if (expectVal !== val) {
                        console.log(`Test failed, result: \n${JSON.stringify(result, null, 2)}; \nexpect: \n${JSON.stringify(expect, null, 2)} `);
                        return;
                    }
                }
            }
        }
        console.log('Test success');
    }

    assert(UpperCamelCase('#@$%'), '');
    assert(UpperCamelCase('camelCase'), 'CamelCase');
    assert(UpperCamelCase('camel_Case'), 'CamelCase');
    assert(UpperCamelCase('_camel_case_'), 'CamelCase');
    assert(UpperCamelCase('_camelCase'), 'CamelCase');
    assert(UpperCamelCase('_CAMELCase'), 'CAMELCase');

    assert(lowerCamelCase('#@$%'), '');
    assert(lowerCamelCase('camelCase'), 'camelCase');
    assert(lowerCamelCase('CamelCase'), 'camelCase');
    assert(lowerCamelCase('Camel_Case'), 'camelCase');
    assert(lowerCamelCase('_Camel_case_'), 'camelCase');
    assert(lowerCamelCase('_CamelCase'), 'camelCase');
    assert(lowerCamelCase('_CAMELCase'), 'CAMELCase');

    assert(snake_case('#@$%'), '');
    assert(snake_case('camelCase'), 'camel_case');
    assert(snake_case('CamelCase'), 'camel_case');
    assert(snake_case('Camel_Case'), 'camel_case');
    assert(snake_case('_Camel_case_'), 'camel_case');
    assert(snake_case('_Camel_Case'), 'camel_case');
    assert(snake_case('_CAMELCase_'), 'CAMEL_case');

    assert(kebab_case('#@$%'), '');
    assert(kebab_case('camelCase'), 'camel-case');
    assert(kebab_case('CamelCase'), 'camel-case');
    assert(kebab_case('Camel_Case'), 'camel-case');
    assert(kebab_case('_Camel_case_'), 'camel-case');
    assert(kebab_case('_Camel_Case'), 'camel-case');
    assert(kebab_case('_CAMELCase_'), 'CAMEL-case');

    assert(getWords(null), '');
    assert(getWords(''), '');
    assert(getWords('#@$%'), '');
    assert(getWords('camelCase'), 'camel, Case');
    assert(getWords('CamelCase'), 'Camel, Case');
    assert(getWords('camel_Case'), 'camel, Case');
    assert(getWords('camel123Case'), 'camel123, Case');
    assert(getWords('123camelCase'), '123camel, Case');
    assert(getWords('123CamelCase'), '123, Camel, Case');
    assert(getWords('camel Case'), 'camel, Case');
    assert(getWords('_camelCase'), 'camel, Case');
    assert(getWords('_camel_Case'), 'camel, Case');
    assert(getWords('_camel_Case_'), 'camel, Case');
    assert(getWords('_camel_case_'), 'camel, case');
    assert(getWords('_camel__case_'), 'camel, case');
    assert(getWords('_camel123__case_'), 'camel123, case');
    assert(getWords('_x__y_'), 'x, y');
    assert(getWords('camel'), 'camel');
    assert(getWords('_camel!_'), 'camel');
    assert(getWords('_!@##$_'), '');
    assert(getWords('_ABBR__HTTP_'), 'ABBR, HTTP');
    assert(getWords('getAllABBRList'), 'get, All, ABBR, List');
    assert(getWords('_get_All_+ABBR_List_'), 'get, All, ABBR, List');
    assert(getWords('_get_AllABBR_List_'), 'get, All, ABBR, List');
    assert(getWords('ABBRName'), 'ABBR, Name');
    assert(getWords('NameABBRRetain'), 'Name, ABBR, Retain');
    assert(getWords('NameABBR_XRetain'), 'Name, ABBR, X, Retain');

    assert(pluralizeLastWord('Case'), 'Cases');
    assert(pluralizeLastWord('Cases'), 'Cases');
    assert(pluralizeLastWord('books'), 'books');
    assert(pluralizeLastWord('camelApple'), 'camelApples');
    assert(pluralizeLastWord('camel_book'), 'camel_books');
    assert(pluralizeLastWord('NameABBR_XRetain_'), 'NameABBR_XRetains_');

    assert(singularizeLastWord('Cases'), 'Case');
    assert(singularizeLastWord('Case'), 'Case');
    assert(singularizeLastWord('book'), 'book');
    assert(singularizeLastWord('camelApples'), 'camelApple');
    assert(singularizeLastWord('camel_books'), 'camel_book');
    assert(singularizeLastWord('NameABBR_XRetains_'), 'NameABBR_XRetain_');


    assertEqual(parseDDL(`
CREATE TABLE \`state\` (
  \`id\` int(11) unsigned NULL AUTO_INCREMENT,
  -- \`country_id\` int(11) unsigned NOT NULL,
  # \`country_id2\` int(11) unsigned NOT NULL,
  /* \`country_id3\` int(11) unsigned NOT NULL,*/
  \`name\` varchar(255) NOT NULL,
  \`abbreviation\` varchar(255) NOT NULL,
  \`is_enabled\` tinyint(1) zerofill DEFAULT '1',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8;
`), [{
        table: 'state',
        fields: [
            {
                field: 'id',
                type: 'int',
                size: 11,
                tsType: 'number',
                unsigned: true,
                notNull: false,
                primary: true,
                autoIncrement: true
            },
            {field: 'name', size: 255, type: 'varchar', tsType: 'string', notNull: true},
            {field: 'abbreviation', size: 255, type: 'varchar', tsType: 'string', notNull: true},
            {field: 'is_enabled', type: 'tinyint', size: 1, tsType: 'boolean', notNull: false, defaultValue: '1'}
        ]
    }]);

}