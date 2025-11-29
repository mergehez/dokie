<script setup lang="ts">
import {computed, ref} from 'vue'
import EndpointsSidebar from './EndpointsSidebar.vue'
import EnvironmentsWindow from './EnvironmentsWindow.vue'
import Icon from "@/components/ui/Icon.vue";
import ArgButton from "@/components/ui/ArgButton.vue";
import {useGlobalEnvs} from "@/utils/useGlobalEnvs.ts";
import Splitter from "@/components/ui/Splitter.vue";

const globalKeyVals = useGlobalEnvs()

const storageValue = ref(localStorage.getItem('sidebar-open') === '1');
const isOpen = computed({
    get: () => storageValue.value,
    set: (val: boolean) => {
        storageValue.value = val;
        localStorage.setItem('sidebar-open', val ? '1' : '0');
    }
})
const toggleCollapse = () => {
    isOpen.value = !isOpen.value
}
</script>

<template>
    <div class="bg-x1 text-black dark:text-gray-100 overflow-y-auto flex flex-col w-screen h-screen">
        <div class="flex items-center  px-2 py-1 gap-2">
            <img src="/src/assets/logo.svg" alt="" class="w-7 h-7">
            <h1 class="mr-auto font-bold  text-2xl flex gap-2 items-center">
                <span style="color: #88D127">Dokie</span>
            </h1>

            <span>Current basepath:</span>
            <span class="font-medium bg-x4 py-0.5 px-2 rounded-md cursor-pointer" @click="toggleCollapse">
                {{ globalKeyVals.hostname || 'No hostname set' }}
            </span>
            <ArgButton icon-only @click="toggleCollapse" severity="raised" class="rounded-full">
                <Icon icon="icon-[tabler--layout-sidebar-right] text-2xl"/>
                <!--<Icon v-else icon="icon-[mdi&#45;&#45;chevron-up] text-2xl"/>-->
            </ArgButton>
        </div>

        <Splitter class="w-full border-none" local-storage-key="sidebar-mainlayout-splitter" :default-width="70" :right-hidden="!isOpen">
            <template #left>
                <EndpointsSidebar/>
            </template>
            <template #right>
                <div class=" space-y-4 bg-x0 p-2 mb-2 h-full">
                    <EnvironmentsWindow/>
                </div>
            </template>
        </Splitter>
        <!--<div v-else class="flex flex-1">-->

        <!--    <EndpointsSidebar/>-->

        <!--    <div class="bg-x2">-->
        <!--        <transition enter-active-class="transition ease-out duration-200"-->
        <!--                    enter-from-class="transform opacity-0 -translate-x-1" enter-to-class="transform opacity-100 translate-x-0"-->
        <!--                    leave-active-class="transition ease-in duration-150" leave-from-class="transform opacity-100 translate-x-0"-->
        <!--                    leave-to-class="transform opacity-0 -translate-x-1">-->
        <!--            <div v-show="isOpen" class=" space-y-4 bg-x1/60  p-4 mb-2">-->
        <!--                <EnvironmentsWindow/>-->
        <!--            </div>-->
        <!--        </transition>-->
        <!--    </div>-->
        <!--</div>-->
    </div>
</template>
