export interface IGeneratorClass {
    help():string;
    generator(args:any):IGeneratorFileItem[];
}

export interface IGeneratorFileItem {
    filename:string,
    content:string
}

