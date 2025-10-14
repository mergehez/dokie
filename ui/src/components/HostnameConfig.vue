<script setup lang="ts">

import {ref} from "vue";
import {useGlobalEnvs} from "@/utils/useGlobalEnvs";
import ArgInput from "@/components/ui/ArgInput.vue";

const globalKeyVals = useGlobalEnvs()
const activeIndex = ref(globalKeyVals.hostnames.findIndex(t => t === globalKeyVals.hostname));

function changeActive(index: number, newValue: boolean) {
    if (!newValue && activeIndex.value === index) {
        activeIndex.value = -1;
        globalKeyVals.hostname = '';
    } else {
        activeIndex.value = index;
        globalKeyVals.hostname = globalKeyVals.hostnames[index]!;
    }
    globalKeyVals.updateIndexedDb();
}

function onChange(val: string, index: number) {
    globalKeyVals.hostnames[index] = val;
    if (activeIndex.value === index) {
        globalKeyVals.hostname = val;
    }
    globalKeyVals.updateIndexedDb();
}
</script>

<template>
    <div class="flex flex-col gap-2 min-w-80">
        <div class="whitespace-nowrap w-full flex items-center justify-between text-sm font-bold">
            Hostname
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
                           :checked="activeIndex === i"
                           @change="e => changeActive(i, (e.target as HTMLInputElement).checked)" class="size-5"/>
                    <ArgInput
                        :model-value="globalKeyVals.hostnames[i]"
                        @update:model-value="(v) => onChange(v||'', i)"
                        placeholder="Value"
                    />
                </div>
            </template>
        </div>
    </div>
</template>