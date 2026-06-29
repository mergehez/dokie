import { useAppConfig } from '@/utils/useAppConfig.ts';
import { type Endpoint } from '@/utils/useEndpoint.ts';
import type { AxiosResponse } from 'axios';
import axiosTypes from '../../node_modules/axios/index.d.ts?raw';
import { useGlobalEnvs } from './useGlobalEnvs';

export const getPostscriptTypings = (withAxios = true, bodyType?: string, responseBodyType?: string) => {
    const globalKeyVals = useGlobalEnvs();
    let headerKeys = globalKeyVals.headers.keyVals.map((t) => "'" + t.key + "'").join(' | ');
    headerKeys += headerKeys ? ' | (string & {})' : 'string';
    let variableKeys = globalKeyVals.variables.keyVals.map((t) => "'" + t.key + "'").join(' | ');
    variableKeys += variableKeys ? ' | (string & {})' : 'string';
    const respType = responseBodyType || 'any';
    const extras = bodyType
        ? `\ndeclare const requestBody: ${bodyType};\ndeclare const request: InternalAxiosRequestConfig<${bodyType}>;`
        : '\ndeclare const request : InternalAxiosRequestConfig;';
    return (
        (withAxios ? axiosTypes.replace(/export /g, 'declare ') : '') +
        `
declare const envs: {
    headers: Record<${headerKeys}, string>,
    variables: Record<${variableKeys}, string>,
};
declare const response : AxiosResponse<${respType}>;${extras}
    `.trim()
    );
};

const config = useAppConfig();

export function defaultPostscript(e: Endpoint) {
    console.log(e, config.postscripts);
    if (e.id in config.postscripts) {
        return config.postscripts[e.id];
    }
    return `/*
declare const envs: {
    headers: Record<string, string>,
    variables: Record<string, string>,
};
declare const response : AxiosResponse;
declare const request : InternalAxiosRequestConfig;
*/

// example:
// envs.variables['my-var'] = response.data.user.username;
`;
}

/** Convert a JSON value to a TypeScript type declaration string. */
export function jsonToTsType(value: unknown): string {
    if (value === null || value === undefined) return 'any';
    if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        const itemTypes = [...new Set(value.map((v) => jsonToTsType(v)))];
        return itemTypes.length === 1 ? `${itemTypes[0]}[]` : `(${itemTypes.join(' | ')})[]`;
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>);
        if (entries.length === 0) return 'Record<string, any>';
        const props = entries.map(([k, v]) => `    "${k}": ${jsonToTsType(v)}`);
        return `{\n${props.join(';\n')};\n}`;
    }
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'any';
}

/** Convert an OpenAPI schema object to a TypeScript type string. */
import type { ReferenceObject, SchemaObject } from '@/utils/types';

function resolveSchema(schema: SchemaObject | ReferenceObject, spec?: any): SchemaObject | undefined {
    if ('$ref' in schema && spec) {
        const refPath = schema.$ref.replace('#/', '').split('/');
        let cur = spec;
        for (const seg of refPath) {
            if (cur) cur = cur[seg];
        }
        return cur as SchemaObject | undefined;
    }
    return schema as SchemaObject;
}

function schemaToTsType(schema: SchemaObject | ReferenceObject | undefined, spec?: any): string {
    const s = schema ? resolveSchema(schema, spec) : undefined;
    if (!s) return 'any';

    if (s.oneOf) return s.oneOf.map((item) => schemaToTsType(item, spec)).join(' | ');
    if (s.anyOf) return s.anyOf.map((item) => schemaToTsType(item, spec)).join(' | ');
    if (s.allOf) return s.allOf.map((item) => schemaToTsType(item, spec)).join(' & ');
    if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(' | ');
    if (s.type === 'array' && s.items) return `${schemaToTsType(s.items, spec)}[]`;
    if (s.type === 'object' && s.properties) {
        const props = Object.entries(s.properties).map(([k, v]) => {
            const required = s.required?.includes(k);
            const opt = required ? '' : '?';
            return `    "${k}"${opt}: ${schemaToTsType(v, spec)}`;
        });
        if (s.additionalProperties) {
            props.push(`    [key: string]: ${schemaToTsType(typeof s.additionalProperties === 'object' ? s.additionalProperties : undefined, spec)}`);
        }
        if (props.length === 0) return 'Record<string, any>';
        return `{\n${props.join(';\n')};\n}`;
    }
    if (s.type === 'array') return 'any[]';
    const typeMap: Record<string, string> = {
        string: 'string',
        integer: 'number',
        number: 'number',
        boolean: 'boolean',
        object: 'Record<string, any>',
    };
    return typeMap[s.type || ''] || 'any';
}

/** Derive a TS type string from an endpoint's OpenAPI response schema. */
export function responseBodyTypeFromSpec(endpoint: any, spec?: any): string | undefined {
    const responses = endpoint?.responses as Record<string, any> | undefined;
    if (!responses) return undefined;
    const successResp = responses['200'] || responses['201'] || responses['default'];
    if (!successResp) return undefined;
    const content = successResp.content?.['application/json'];
    if (!content?.schema) return undefined;
    return schemaToTsType(content.schema, spec);
}

export function runPostscript(script: string, response: AxiosResponse) {
    if (!response) return;
    if (script) {
        setTimeout(() => {
            try {
                const request = response.config;

                const globalKeyVals = useGlobalEnvs();
                const envs = {
                    headers: Object.fromEntries(globalKeyVals.headers.keyVals.map((t) => [t.key, t.value])),
                    variables: Object.fromEntries(globalKeyVals.variables.keyVals.map((t) => [t.key, t.value])),
                };

                eval(script); // eslint-disable-line no-eval

                for (const [key, value] of Object.entries(envs.variables)) {
                    globalKeyVals.variables.upsert(key, value ?? '');
                }
                for (const [key, value] of Object.entries(envs.headers)) {
                    globalKeyVals.headers.upsert(key, value ?? '');
                }
                void globalKeyVals.updateIndexedDb();
            } catch (e) {
                console.error('Error running postscript:', e);
                alert('Error running postscript. ' + (e as Error).message);
            }
        }, 500);
    }
}
