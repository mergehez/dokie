import {reactive} from "vue";
import {defineStore} from "@/utils/utils.ts";

function _useAppConfig() {
    const config: typeof window.dokie = window.dokie ?? {
        "currentHostname": location.host,
        "documentName": "v1",
        "hostnames": [],
        "variables": {
            "username": "mazlum",
            "password": "my-password"
        },
        "headers": {
            "x-api-key": "test-api-key",
            "Content-Type": "application/json"
        },
        "postscripts": {
            "GET /api/login": "envs.headers['x-api-key'] = response.data.value.ticket;",
        },
        "favorites": [
            "GET /api/login",
        ]
    }

    config.postscripts ??= {};
    config.currentHostname ||= location.host
    config.documentName ||= "v1";
    config.hostnames ??= [];
    config.variables ??= {};
    config.headers ??= {};
    config.favorites ??= [];

    return reactive({
        ...config,
        openApiUrl: config.currentHostname + '/openapi/' + config.documentName + ".json",
    })
}

export type AppConfig = ReturnType<typeof _useAppConfig>;

export const useAppConfig = defineStore('app-config', _useAppConfig);