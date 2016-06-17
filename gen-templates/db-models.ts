import {GeneratorFunctionResult} from "../GeneratorFunction";
export default function generator(...args:string[]):GeneratorFunctionResult {
    return [
        {
            filename: 'abc.ts',
            content: 
`
interface {}
`,
        }
    ]
}