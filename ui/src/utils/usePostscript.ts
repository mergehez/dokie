import {type Endpoint} from "@/utils/useEndpoint.ts";
import {useGlobalEnvs} from "./useGlobalEnvs";
import type {AxiosResponse} from "axios";
import axiosTypes from "../../node_modules/axios/index.d.ts?raw";
import {useAppConfig} from "@/utils/useAppConfig.ts";

export const postscriptMonaco = (withAxios = true) => {
    const globalKeyVals = useGlobalEnvs();
    let headerKeys = globalKeyVals.headers.keyVals.map(t => "'" + t.key + "'").join(' | ');
    headerKeys += headerKeys ? ' | (string & {})' : 'string'
    let variableKeys = globalKeyVals.variables.keyVals.map(t => "'" + t.key + "'").join(' | ');
    variableKeys += variableKeys ? ' | (string & {})' : 'string';
    return (withAxios ? axiosTypes.replace(/export /g, 'declare ') : '')
        + `
declare const envs: {
    headers: Record<${headerKeys}, string>,
    variables: Record<${variableKeys}, string>,
};
declare const response : AxiosResponse;
declare const request : InternalAxiosRequestConfig;
    `.trim();
}

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

export function runPostscript(script: string, response: AxiosResponse) {
    if (!response)
        return;
    if (script) {
        setTimeout(() => {
            try {
                const request = response.config;

                const globalKeyVals = useGlobalEnvs();
                const envs = {
                    headers: Object.fromEntries(globalKeyVals.headers.keyVals.map(t => [t.key, t.value])),
                    variables: Object.fromEntries(globalKeyVals.variables.keyVals.map(t => [t.key, t.value])),
                }

                eval(script); // eslint-disable-line no-eval

                for (const [key, value] of Object.entries(envs.variables)) {
                    globalKeyVals.variables.upsert(key, value ?? '');
                }
                for (const [key, value] of Object.entries(envs.headers)) {
                    globalKeyVals.headers.upsert(key, value ?? '');
                }
                globalKeyVals.updateIndexedDb();
            } catch (e) {
                console.error('Error running postscript:', e);
                alert('Error running postscript. ' + (e as Error).message);
            }
        }, 500);
    }
}