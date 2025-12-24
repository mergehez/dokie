import {computed, reactive, ref} from "vue";
import {defineStore, uniqueId} from "@/utils/utils";
import type {OpenApiEndpoint, OpenAPIV3, ParameterObject, SchemaObject} from "./types";
import {type ApiRequest, type ApiResponse, type KeyVal, useDb} from "@/utils/useDb.ts";
import {AxiosError} from "axios";
import {useUri} from "@/utils/useUri.ts";
import {JSONC} from "@/utils/json_helpers.ts";
import {generateDefaultBodyFromSchema, Parsed} from "@/utils/useEndpointBody.ts";
import {useAppConfig} from "@/utils/useAppConfig.ts";
import {useKeyValCollection} from "@/utils/useKeyValCollection.ts";


type Part = 'query' | 'header' | 'route';

export type Endpoint = ReturnType<typeof _createEndpoint>;
type UseEndpointOpts = {
    path: string, method: string, openApiEndpoint: OpenApiEndpoint, addDefaults?: boolean, spec?: OpenAPIV3
}

function _createEndpoint(id: string, opts: UseEndpointOpts) {
    const {keyVals: _allKeyVals} = useDb();
    const _all = reactive(_allKeyVals.getEndpoint(id))

    const config = useAppConfig()
    const response = ref<ApiResponse>();
    const request = reactive<ApiRequest>({
        method: opts.method,
        url: opts.path,
        body: _all.body || config.bodies[id] || '',
        bodyType: 'json',
        // formData: useKeyValCollection([{id: uniqueId(), key: '', value: ''}]),
        headers: Object.fromEntries(_all.header.map(t => [t.key, t.value || ''])),
        postscript: _all.postscript ?? config.postscripts[id]!,
    });

    function updateCurrentUrl() {
        const uri = useUri(request.url);
        Object.values(_all.query).forEach(({key, value}) => {
            if (key && value) {
                uri.params[key] = value;
            }
        });
        request.url = uri.toString()[1]!;
    }

    updateCurrentUrl();
    let requestDefaultBody: Parsed;

    function generateDefaultBody() {
        if (opts.spec && opts.openApiEndpoint.requestBody && 'content' in opts.openApiEndpoint.requestBody)
            requestDefaultBody ??= generateDefaultBodyFromSchema(opts.spec, opts.openApiEndpoint.requestBody);

        else
            requestDefaultBody ??= Parsed.emptyObject();
        return requestDefaultBody;
    }

    setTimeout(() => {
        if (!request.body)
            request.body = JSONC.stringify(generateDefaultBody().unparse(false));
    }, 200);

    const activeRequestTab = ref<'params' | 'body' | 'headers' | 'postscript'>('params');


    if (opts.addDefaults ?? true) {
        function getParamsFromSpec(type: 'path' | 'query' | 'header') {
            return (opts.openApiEndpoint.parameters?.filter((param) => {
                return param && 'in' in param && param.in === type;
            }) ?? []) as ParameterObject[] | [];
        }

        const allParams = {
            route: getParamsFromSpec('path'),
            header: getParamsFromSpec('header'),
            query: getParamsFromSpec('query'),
        } satisfies Record<Part, ParameterObject[]>;
        for (const key in allParams) {
            const k = key as Part;
            const params = allParams[k] ?? [];
            for (const param of params) {
                const s = param.schema as SchemaObject;
                const fromState = _all[k].find((kv) => kv.key === param.name);
                const defValue = String(param.example || (s && s.default) || '');
                if (!fromState) {
                    _all[k].push({
                        id: uniqueId(),
                        key: param.name,
                        desc: param.description,
                        value: defValue,
                        required: param.required,
                    } satisfies KeyVal);
                } else {
                    if (param.required && !fromState.value?.trim())
                        fromState.value = defValue;
                    fromState.desc = param.description;
                    fromState.required = param.required;
                }
            }
        }
    }

    const queryKeyVals = useKeyValCollection(_all.query);
    const headerKeyVals = useKeyValCollection(_all.header);
    const routeKeyVals = useKeyValCollection(_all.route);
    const formData = useKeyValCollection(_all.formData);
    // const bodyKeyVals = useKeyValCollection(_all.body);

    const axiosError = ref<AxiosError>();
    const isLoading = ref(false);
    const recentlyFailed = ref(false);
    const recentlySucceeded = ref(false);
    return reactive({
        id: id,
        path: computed(() => opts.path),
        hash: computed(() => btoa(`${opts.path}${opts.method}`)),
        method: computed(() => opts.method),
        ...opts.openApiEndpoint,
        all: _all,
        queryKeyVals: queryKeyVals,
        headerKeyVals: headerKeyVals,
        routeKeyVals: routeKeyVals,
        formData: formData,
        request: request,
        response: response,
        activeRequestTab: activeRequestTab,
        updateIndexedDb: async () => {
            await _allKeyVals.upsert(id, _all);
            await _allKeyVals.updateDb();
        },
        isSending: isLoading,
        recentlySucceeded: computed({
            get: () => recentlySucceeded.value,
            set: (val: boolean) => {
                recentlySucceeded.value = val;
                if (val) {
                    setTimeout(() => {
                        recentlySucceeded.value = false;
                    }, 2000);
                }
            }
        }),
        recentlyFailed: computed({
            get: () => recentlyFailed.value,
            set: (val: boolean) => {
                recentlyFailed.value = val;
                if (val) {
                    setTimeout(() => {
                        recentlyFailed.value = false;
                    }, 2000);
                }
            }
        }),
        axiosError: axiosError,
        generateDefaultBody: generateDefaultBody,
        updateCurrentUrl: updateCurrentUrl,
    });
}

export function useEndpoint(opts: UseEndpointOpts): Endpoint {
    const id = `${opts.method} ${opts.path}`;
    return defineStore(id, () => _createEndpoint(id, opts))();
}
