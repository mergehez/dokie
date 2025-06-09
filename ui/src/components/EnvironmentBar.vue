<script setup lang="ts">
import {type KeyVal} from '@/utils/useDb.ts'
import {useGlobalEnvs} from "@/utils/useGlobalEnvs";
import {ref} from 'vue'
import EnvDataTable from './EnvDataTable.vue'
import HostnameConfig from "@/components/HostnameConfig.vue";
import ArgButton from "@/components/ui/ArgButton.vue";
import Icon from "@/components/ui/Icon.vue";

const globalKeyVals = useGlobalEnvs()
const isOpen = ref(false)


const updateKeyValue = (kv: KeyVal) => {
    // envStore.set(kv.key, value)
}

const toggleCollapse = () => {
    isOpen.value = !isOpen.value
}
</script>

<template>
    <div class="w-full bg-x2">
        <div class="flex items-center justify-between px-2 py-1">
            <span class="font-medium">
                {{ globalKeyVals.hostname || 'No hostname set' }}
            </span>
            <ArgButton icon-only @click="toggleCollapse" severity="secondary" class="rounded-full">
                <Icon v-if="!isOpen" icon="icon-[mdi--chevron-down] text-2xl"/>
                <Icon v-else icon="icon-[mdi--chevron-up] text-2xl"/>
            </ArgButton>
        </div>
        <transition enter-active-class="transition ease-out duration-200"
                    enter-from-class="transform opacity-0 -translate-y-1" enter-to-class="transform opacity-100 translate-y-0"
                    leave-active-class="transition ease-in duration-150" leave-from-class="transform opacity-100 translate-y-0"
                    leave-to-class="transform opacity-0 -translate-y-1">
            <div v-show="isOpen" class="w-full space-y-4 bg-x1/60  p-4 mb-2">
                <div class="flex gap-2">
                    <HostnameConfig/>
                    <div class="flex flex-col flex-1 gap-2">
                        <div class="whitespace-nowrap w-full flex justify-between items-center pl-1 text-sm font-bold">
                            Variables
                            <button
                                @click="() => globalKeyVals.variables.addNew()"
                                class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                <i class="icon icon-[mdi--plus]"></i>
                                Add
                            </button>
                        </div>
                        <EnvDataTable
                            :kv-collection="globalKeyVals.variables"
                            :on-change="updateKeyValue"
                            :skip="p => p.key === 'hostname' || p.key === 'hostnames'"/>

                        <div class="whitespace-nowrap w-full flex justify-between items-center pl-1 text-sm font-bold">
                            Global Headers
                            <button
                                @click="() => globalKeyVals.headers.addNew()"
                                class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                <i class="icon icon-[mdi--plus]"></i>
                                Add
                            </button>
                        </div>
                        <EnvDataTable :kv-collection="globalKeyVals.headers"
                                      :on-change="updateKeyValue"/>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>