import {reactive} from "vue";
import {defineStore} from "@/utils/utils.ts";

function _useAppConfig() {
    const config: typeof window.dokie = window.dokie ?? {
        "currentHostname": location.host,
        "openApiJsonUrl": "",
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
    config.openApiJsonUrl ||= config.currentHostname + '/openapi/v1.json';
    config.hostnames ??= [];
    config.variables ??= {};
    config.headers ??= {};
    config.favorites ??= [];

    return reactive(config)
}

export type AppConfig = ReturnType<typeof _useAppConfig>;

export const useAppConfig = defineStore('app-config', _useAppConfig);