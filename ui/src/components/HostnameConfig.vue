<script setup lang="ts">

import {uniqueId} from "@/utils/utils.ts";
import {ref, watch} from "vue";
import {useGlobalEnvs} from "@/utils/useGlobalEnvs";
import ArgInput from "@/components/ui/ArgInput.vue";

const globalKeyVals = useGlobalEnvs()

const activeHostname = ref(globalKeyVals.hostname ?? '')
const hostNames = ref<{ id: string, value: string, active: boolean }[]>(globalKeyVals.hostnames.map((t: any) => ({
    id: uniqueId(),
    value: t,
    active: t === activeHostname.value
})));

let timeout: any;
watch(hostNames, (nv) => {
    globalKeyVals.hostnames = nv.map(x => x.value);
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
        const empty = nv.filter(x => !x.value.length)
        if (empty.length > 1) {
            for (let i = 0; i < empty.length - 1; i++) {
                const idx = nv.findIndex(x => x.id === empty[i].id);
                if (idx >= 0) {
                    nv.splice(idx, 1);
                }
            }
        }
    }, 1000);
}, {deep: true});

function setHostnameActive(h: { id: string, value: string, active: boolean }) {
    activeHostname.value = h.value
    hostNames.value.forEach(t => t.active = t.value === h.value)
    globalKeyVals.hostname = h.value;
}
</script>

<template>
    <div class="flex flex-col gap-2 min-w-80">
        <div class="whitespace-nowrap w-full flex items-center justify-between text-sm font-bold">
            Hostname
            <button
                :disabled="hostNames.some(t => !t.value)"
                @click="() => hostNames.push({id: uniqueId(), value: '', active: false})"
                class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                :class="hostNames.some(t => !t.value) ? 'opacity-50': ''"
            >
                <i class="icon icon-[mdi--plus]"></i>
                Add
            </button>
        </div>
        <div class="flex flex-col w-full">
            <template v-for="h in hostNames" :key="h.id">
                <div class="w-full flex gap-1 items-center">
                    <input type="checkbox" v-model="h.active" @change="setHostnameActive(h)" class="size-5"/>
                    <ArgInput
                        v-model="h.value"
                        @update:model-value="() => globalKeyVals.updateIndexedDb()"
                        placeholder="Value"
                    />
                </div>
            </template>
        </div>
    </div>
</template>