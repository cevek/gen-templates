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

export function pluralize(name:string) {
    const parts = getWords(name);
    if (parts.length == 0) {
        return name;
    }
    const lastWord = parts.pop();
    const lastPos = name.lastIndexOf(lastWord);

    return name.substr(0, lastPos) + plural(lastWord) + name.substr(lastPos + lastWord.length);
}

function strToMap(str:string) {
    const map:{[i:string]:boolean} = {};
    for (var i = 0; i < str.length; i++) {
        map[str[i]] = true;
    }
    return map;
}
const upperLetters = strToMap('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const lowerLetters = strToMap('abcdefghijklmnopqrstuvwxyz');

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
    assert(getWords('camel Case'), 'camel, Case');
    assert(getWords('_camelCase'), 'camel, Case');
    assert(getWords('_camel_Case'), 'camel, Case');
    assert(getWords('_camel_Case_'), 'camel, Case');
    assert(getWords('_camel_case_'), 'camel, case');
    assert(getWords('_camel__case_'), 'camel, case');
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

    assert(pluralize('Case'), 'Cases');
    assert(pluralize('camelApple'), 'camelApples');
    assert(pluralize('camel_book'), 'camel_books');
    assert(pluralize('NameABBR_XRetain_'), 'NameABBR_XRetains_');
}