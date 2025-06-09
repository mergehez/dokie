import {defineStore, distinct} from "./utils";
import {useDb} from "@/utils/useDb.ts";
import {computed, reactive, ref, watch} from "vue";
import {useAppConfig} from "@/utils/useAppConfig.ts";
import {useKeyValCollection} from "@/utils/useKeyValCollection.ts";

function _createGlobalEnvs() {
    const {globalKeyVals} = useDb();
    const all = ref(globalKeyVals.value);

    const config = useAppConfig()
    all.value.hostnames = distinct([...all.value.hostnames, ...config.hostnames]);
    all.value.hostname ||= config.hostnames[0] || '';
    const headers = useKeyValCollection(all.value.headers);
    const variables = useKeyValCollection(all.value.variables);

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
        hostname: computed({
            get: () => all.value.hostname,
            set: (v: string) => {
                all.value.hostname = v;
            }
        }),
        hostnames: computed(() => all.value.hostnames),
        variables: variables,
        headers: headers,
        updateIndexedDb: globalKeyVals.updateDb,
    })
}

export type GlobalEnvs = ReturnType<typeof _createGlobalEnvs>;

export const useGlobalEnvs = defineStore('/globals', _createGlobalEnvs);
