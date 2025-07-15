import {useUri} from "@/utils/useUri.ts";
import {JSONC} from "@/utils/json_helpers.ts";
import axios, {type AxiosError, type AxiosRequestConfig, type AxiosResponse} from "axios";
import {runPostscript} from "@/utils/usePostscript.ts";
import {type Endpoint} from "@/utils/useEndpoint.ts";
import {useGlobalEnvs} from "./useGlobalEnvs";

export async function sendRequest(e: Endpoint) {
    try {
        const globalKeyVals = useGlobalEnvs();
        const currApiCall = e.apiCall;

        function applyEnvsToString(str: string) {
            const allGlobalKeyVals = globalKeyVals.headers.merge(globalKeyVals.variables);
            str = str?.toString() || '';
            str = str.replace(/{{([A-z0-9_-]+)}}/g, (match, p1) => allGlobalKeyVals.find(t => t.key == p1)?.value || match);
            str = str.replace(/{([A-z0-9_-]+)}/g, (match, p1) => {
                return e.routeKeyVals.getValue(p1) || match
            });

            return str;
        }

        e.isLoading = true;
        const startTime = performance.now();
        let hostname = globalKeyVals.hostname ?? '';
        if (hostname.endsWith('/'))
            hostname = hostname.substring(0, hostname.length - 1);
        const uri = useUri(hostname + applyEnvsToString(currApiCall.request.url));
        for (const {key, value, required} of Object.values(e.queryKeyVals.keyVals)) {
            if (key && value) {
                uri.params[key] = applyEnvsToString(value);
            }
            if (key && required && !value) {
                alert(`Missing required query parameter: ${key}`);
                return;
            }
        }

        for (const {key, value, required} of Object.values(e.routeKeyVals.keyVals)) {
            if (key && required && !value) {
                alert(`Missing required route parameter: ${key}`);
                return;
            }
        }

        let url = uri.toString()[0] + uri.toString()[1];
        url = applyEnvsToString(url);
        const headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Access-Control-Expose-Headers': '*',
            ...globalKeyVals.headers.merge(e.headerKeyVals).reduce((acc, {key, value}) => {
                if (key && value) {
                    acc[key] = applyEnvsToString(value);
                }
                return acc;
            }, {} as Record<string, string>)
        };
        console.log('url: ' + url);
        if (body && body.includes('//')) {
        let body = currApiCall.request?.body;
            body = JSON.stringify(JSONC.parse(body), null, 2);
        }
        if (body) {
            body = applyEnvsToString(body);
        }
        const config: AxiosRequestConfig = {
            method: currApiCall.request.method,
            url: url,
            headers: headers,
            data: isContentJson && body
                ? JSON.parse(body)
                : (currApiCall.request.method === 'GET' ? undefined : isContentJson ? {} : body),
        };
        try {
            function handleResponse(res: AxiosResponse) {
                let dataStr = typeof res.data == 'object' || !res.data
                    ? JSON.stringify(res.data || {failedRequestInfo: res}, null, 2)
                    : (res.data || res.statusText).toString();
                const size = dataStr.length;
                const contentType = res.headers?.['content-type'];
                const isJson = contentType?.includes('application/json') ||
                    contentType?.includes('application/problem+json');
                if (isJson) {
                    const data = JSON.parse(dataStr);
                    dataStr = JSON.stringify(data, null, 2);
                }
                currReqInstance.response = {
                currApiCall.request.headers = headers;
                    duration: performance.now() - startTime,
                    isRedirect: res.status >= 300 && res.status < 400,
                    isSuccess: res.status >= 200 && res.status < 300,
                    body: dataStr,
                    status: res.status,
                    statusText: res.statusText,
                    size: size,
                    isJson: isJson,
                    headers: res.headers ? Object.entries(res.headers) : [],
                    contentType: res.headers?.['Content-Type'] || res.headers?.['content-type'] || '',
                };

                runPostscript(currReqInstance.request.postscript, res);
                return res;
            }

            const res = await axios.request(config)
                .then(handleResponse)
                .catch((t: AxiosError) => {
                    if (t.response)
                        return handleResponse(t.response);

                    throw t;
                });
        } catch (error) {
            console.error('Error sending request:', error);
            e.axiosError = error as any;
        } finally {
            e.all.body = currApiCall.request.body
            e.all.postscript = currApiCall.request.postscript
            e.updateIndexedDb();
        }
    } finally {
        e.isLoading = false;
    }
}
