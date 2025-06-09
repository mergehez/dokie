import {defineStore, distinct} from "./utils";
import {useDb} from "@/utils/useDb.ts";
import {reactive, watch} from "vue";
import {useAppConfig} from "@/utils/useAppConfig.ts";
import {useKeyValCollection} from "@/utils/useKeyValCollection.ts";

function _createGlobalEnvs() {
    const {globalKeyVals} = useDb();
    const all = globalKeyVals.value;

    const config = useAppConfig()
    all.hostnames = distinct([...all.hostnames, ...config.hostnames]);
    all.hostname ||= config.hostnames[0] || '';
    const headers = useKeyValCollection(all.headers);
    const variables = useKeyValCollection(all.variables);

    for (const predefinedHeader in config.headers) {
        headers.insertIfNotExists(predefinedHeader, config.headers[predefinedHeader]);
        headers.get(predefinedHeader)!.locked = true;
    }

    for (const predefinedVariable in config.variables) {
        variables.insertIfNotExists(predefinedVariable, config.variables[predefinedVariable]);
        variables.get(predefinedVariable)!.locked = true;
    }
    watch(all, () => {
        console.log('globalEnv changed')
        globalKeyVals.updateDb();
    }, {deep: true});

    return reactive({
        hostname: all.hostname,
        hostnames: all.hostnames,
        variables: variables,
        headers: headers,
        updateIndexedDb: globalKeyVals.updateDb,
    })
}

export type GlobalEnvs = ReturnType<typeof _createGlobalEnvs>;

export const useGlobalEnvs = defineStore('/globals', _createGlobalEnvs);
