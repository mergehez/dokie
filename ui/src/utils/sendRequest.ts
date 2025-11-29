import {useUri} from "@/utils/useUri.ts";
import {JSONC} from "@/utils/json_helpers.ts";
import axios, {AxiosError, type AxiosRequestConfig, type AxiosResponse} from "axios";
import {runPostscript} from "@/utils/usePostscript.ts";
import {type Endpoint} from "@/utils/useEndpoint.ts";
import {useGlobalEnvs} from "./useGlobalEnvs";
import mime from "mime";
import {useNavState} from "@/utils/useNavState.ts";

export async function sendRequest(e: Endpoint) {
    const globalKeyVals = useGlobalEnvs();
    const currApiCall = e.apiCall;
    const startTime = performance.now();
    let success = false;

    function applyEnvsToString(str: string) {
        const allGlobalKeyVals = globalKeyVals.headers.merge(globalKeyVals.variables);
        str = str?.toString() || '';
        str = str.replace(/{{([A-z0-9_-]+)}}/g, (match, p1) => allGlobalKeyVals.find(t => t.key == p1)?.value || match);
        str = str.replace(/{([A-z0-9_-]+)}/g, (match, p1) => {
            return e.routeKeyVals.getValue(p1) || match
        });

        return str;
    }

    function prepareUrl() {
        let hostname = globalKeyVals.hostname ?? '';
        if (hostname.endsWith('/'))
            hostname = hostname.substring(0, hostname.length - 1);
        const uri = useUri(hostname + applyEnvsToString(currApiCall.request.url));
        for (const {key, value, required} of Object.values(e.queryKeyVals.keyVals)) {
            if (key && value) {
                uri.params[key] = applyEnvsToString(value);
            }
            if (key && required && !value) {
                throw new AxiosError(`Missing required query parameter: ${key}`);
            }
        }

        for (const {key, value, required} of Object.values(e.routeKeyVals.keyVals)) {
            if (key && required && !value) {
                throw new AxiosError(`Missing required route parameter: ${key}`);
            }
        }

        return applyEnvsToString(uri.toString().join(''));
    }

    function prepareHeaders() {
        return {
            'content-type': 'application/json',
            'accept': '*/*',
            'cache-control': 'no-cache',
            'access-control-expose-headers': '*',
            ...globalKeyVals.headers.merge(e.headerKeyVals).reduce((acc, {key, value}) => {
                if (key && value) {
                    acc[key.toLowerCase()] = applyEnvsToString(value);
                }
                return acc;
            }, {} as Record<string, string>)
        };
    }

    function prepareRequest() {
        const url = prepareUrl();
        console.log('url: ' + url);
        const headers = prepareHeaders();

        let body = currApiCall.request?.body;
        const isContentJson = headers['content-type'] == 'application/json';

        // Handle JSONC body
        if (isContentJson && body && body.includes('//')) {
            body = JSON.stringify(JSONC.parse(body), null, 2);
        }

        if (body) {
            body = applyEnvsToString(body);
        }

        const config: AxiosRequestConfig = {
            responseType: 'arraybuffer',
            method: currApiCall.request.method,
            url: url,
            headers: headers,
            data: isContentJson && body
                ? JSON.parse(body)
                : (currApiCall.request.method === 'GET' ? undefined : isContentJson ? {} : body),
        };
        return config
    }

    function handleResponse(res: AxiosResponse) {
        let dataStr = res.data instanceof ArrayBuffer
            ? new TextDecoder().decode(res.data)
            : typeof res.data == 'object' || !res.data
                ? JSON.stringify(res.data || {failedRequestInfo: res}, null, 2)
                : (res.data || res.statusText).toString();

        let dataObj = {} as any;
        try {
            if (res.data instanceof ArrayBuffer)
                dataObj = JSON.parse(dataStr);
            else if (typeof res.data === 'object')
                dataObj = res.data;
        } catch (_) {
        }

        const size = dataStr.length;
        const contentType = res.headers?.['content-type'];
        const isJson = contentType?.includes('application/json') ||
            contentType?.includes('application/problem+json');

        if (isJson) {
            const data = JSON.parse(dataStr);
            dataStr = JSON.stringify(data, null, 2);
        }

        currApiCall.request.headers = JSON.parse(JSON.stringify(res.config.headers))

        const cType = res.headers?.['Content-Type'] || res.headers?.['content-type'] || '';
        currApiCall.response = {
            duration: performance.now() - startTime,
            isRedirect: res.status >= 300 && res.status < 400,
            isSuccess: res.status >= 200 && res.status < 300,
            bodyArrayBuffer: res.data, // arraybuffer
            body: dataObj, // arraybuffer
            bodyStr: dataStr,
            status: res.status,
            statusText: res.statusText,
            size: size,
            isJson: isJson,
            headers: res.headers ? Object.entries(res.headers) : [],
            contentType: cType,
            ext: mime.getExtension(cType) || (cType == 'application/problem+json' ? 'json' : ''),
        };

        runPostscript(currApiCall.request.postscript, {
            ...res,
            data: dataObj,
        });

        return res;
    }


    e.isLoading = true;
    try {
        const config = prepareRequest();

        const res = await axios.request(config)
            .then(handleResponse)
            .catch((t: AxiosError) => {
                if (t.response) {
                    return handleResponse(t.response);
                }

                throw t;
            }).finally(() => {
                e.all.body = currApiCall.request.body
                e.all.postscript = currApiCall.request.postscript
                e.updateIndexedDb();
            })

        success = res.status >= 200 && res.status < 300;
    } catch (err) {
        console.error('Error sending request:', err);
        e.axiosError = err instanceof AxiosError ? err : new AxiosError((err as Error).message);
    } finally {
        e.recentlyFailed = !success;
        e.recentlySucceeded = success;

        if (!success) {
            const sidebar = useNavState();
            sidebar.selectEndpoint(e);
        }
        e.isLoading = false;
    }
}
