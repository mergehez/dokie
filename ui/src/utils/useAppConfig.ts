import {reactive} from "vue";
import {defineStore} from "@/utils/utils.ts";

function _useAppConfig() {
    const config: typeof window.dokie = window.dokie ?? {
        "currentHostname": location.host,
        // "openApiJsonUrl": "http://127.0.0.1:8000/openapi",
        "openApiJsonUrl": "https://localhost:35125/openapi/internal.json",
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
        "bodies": {
            "GET /api/login": `{
                "email": "{{email}}",
                "password": "{{password}}"
            }`,
        },
        "favorites": [
            "GET /api/login",
        ]
    }

    config.currentHostname ||= location.host
    config.openApiJsonUrl ||= config.currentHostname + '/openapi/v1.json';
    config.postscripts ??= {};
    config.bodies ??= {};
    config.hostnames ??= [];
    config.variables ??= {};
    config.headers ??= {};
    config.favorites ??= [];

    return reactive(config)
}

export type AppConfig = ReturnType<typeof _useAppConfig>;

export const useAppConfig = defineStore('app-config', _useAppConfig);