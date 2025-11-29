import stripJsonComments from "strip-json-comments";

type JsonCObject = {
    [key: string]: JsonCValue
}

type JsonCValue =
    | string
    | number
    | boolean
    | null
    | CommentedValue
    | JsonCObject
    | JsonCValue[];

export class CommentedValue {
    constructor(public value: any, public comment: string) {
    }
}

export const JSONC = {
    stringify: serializeJsonC,
    parse: (strWithComments: string) => JSON.parse(stripJsonComments(strWithComments))
}

function serializeJsonC(json: JsonCObject, indent = 0): string {
    // if(indent == 0)
    //     console.log(json)
    const tabSize = 2;
    const indentStr = ' '.repeat(indent + tabSize);

    const lines = Object.entries(json).map(([key, value]) => {
        const isObj = typeof value === 'object' && value !== null;

        if (!isObj) {
            return `${indentStr}"${key}": ${JSON.stringify(value)},`;
        }

        const obj = value as any;

        if (Array.isArray(value)) {
            const objStrs = [];
            for (const arrItem of value) {
                const objStr = serializeJsonC(arrItem as JsonCObject, 0).split('\n').map(l => `${' '.repeat(tabSize)}${indentStr}${l}`).join('\n');
                objStrs.push(objStr)
            }
            return `${indentStr}"${key}": [\n` + objStrs.join(',\n') + `\n${indentStr}],`;
        }

        if (obj instanceof CommentedValue) {
            return `${indentStr}"${key}": ${JSON.stringify(obj.value)}, // ${obj.comment}`;
        }
        return `${indentStr}"${key}": {\n${serializeJsonC(obj as JsonCObject, indent + tabSize)}\n${indentStr}},`;
    });

    if (lines.length == 0) return '';
    lines[lines.length - 1] = lines[lines.length - 1]!.slice(0, -1);
    if (indent === 0) {
        return `{\n${lines.join('\n')}\n}`;
    } else {
        return lines.join('\n');
    }
}