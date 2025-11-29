<script setup lang="ts">
import {type KeyVal} from '@/utils/useDb.ts'
import {useGlobalEnvs} from "@/utils/useGlobalEnvs";
import EnvDataTable from './EnvDataTable.vue'
import {ref} from "vue";
import ArgInput from "@/components/ui/ArgInput.vue";

const globalKeyVals = useGlobalEnvs()

const updateKeyValue = (kv: KeyVal) => {
    // envStore.set(kv.key, value)
}


const activeHostnameIndex = ref(globalKeyVals.hostnames.findIndex(t => t === globalKeyVals.hostname));

function changeActiveHostname(index: number, newValue: boolean) {
    if (!newValue && activeHostnameIndex.value === index) {
        activeHostnameIndex.value = -1;
        globalKeyVals.hostname = '';
    } else {
        activeHostnameIndex.value = index;
        globalKeyVals.hostname = globalKeyVals.hostnames[index]!;
    }
    globalKeyVals.updateIndexedDb();
}

function onHostnameChange(val: string, index: number) {
    globalKeyVals.hostnames[index] = val;
    if (activeHostnameIndex.value === index) {
        globalKeyVals.hostname = val;
    }
    globalKeyVals.updateIndexedDb();
}

</script>

<template>
    <div class="flex gap-1 flex-col">
        <div class="whitespace-nowrap w-full flex items-center justify-between text-sm font-bold">
            <span class="text-base">Basepath</span>
            <button
                :disabled="globalKeyVals.hostnames.some(t => !t)"
                @click="() => globalKeyVals.hostnames.push('')"
                class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                :class="globalKeyVals.hostnames.some(t => !t) ? 'opacity-50': ''"
            >
                <i class="icon icon-[mdi--plus]"></i>
                Add
            </button>
        </div>
        <div class="flex flex-col w-full">
            <template v-for="(_, i) in globalKeyVals.hostnames" :key="i">
                <div class="w-full flex gap-1 items-center">
                    <input type="checkbox"
                           :checked="activeHostnameIndex === i"
                           @change="e => changeActiveHostname(i, (e.target as HTMLInputElement).checked)" class="size-5"/>
                    <ArgInput
                        :model-value="globalKeyVals.hostnames[i]"
                        @update:model-value="(v) => onHostnameChange(v||'', i)"
                        placeholder="Value"
                    />
                </div>
            </template>
        </div>

        <i></i>

        <div class="whitespace-nowrap w-full flex justify-between items-center  text-sm font-bold mt-4">
            <span class="text-base">Variables</span>
            <button
                @click="() => globalKeyVals.variables.addNew()"
                class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                <i class="icon icon-[mdi--plus]"></i>
                Add
            </button>
        </div>
        <EnvDataTable
            code="globals"
            :kv-collection="globalKeyVals.variables"
            :on-change="updateKeyValue"
            :skip="p => p.key === 'hostname' || p.key === 'hostnames'"/>


        <i></i>

        <div class="whitespace-nowrap w-full flex justify-between items-center pl-1 text-sm font-bold mt-4">
            <span class="text-base">Global Headers</span>
            <button
                @click="() => globalKeyVals.headers.addNew()"
                class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                <i class="icon icon-[mdi--plus]"></i>
                Add
            </button>
        </div>
        <EnvDataTable
            code="globals"
            :kv-collection="globalKeyVals.headers"
            :on-change="updateKeyValue"/>
    </div>
</template>