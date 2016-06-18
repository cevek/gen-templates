export interface GeneratorClass {
    generator():GeneratorFileItem[];
}

export interface GeneratorFileItem {
    filename:string,
    content:string
}

