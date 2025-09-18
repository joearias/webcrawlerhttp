declare module 'args-parser' {
    export function argsParser(argv: string[]): { [key: string]: any };
    export default argsParser;
}