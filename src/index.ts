"use strict";
require('ts-node/register');
export {IGeneratorClass} from "./lib/igenerator-class";
export {UpperCamelCase, lowerCamelCase, kebab_case, snake_case, trimLines, pluralizeLastWord, singularizeLastWord} from "./lib/strings";
export {currentDir, findGenTemplatesRoot} from './lib/io';
