export interface GeneratorFunction {
    (...args:string[]):GeneratorFunctionResult;
}

export type GeneratorFunctionResult = GeneratorFileItem[];

export interface GeneratorFileItem {
    filename:string,
    content:string
}

