<script setup lang="ts">

import HttpMethod from "@/components/HttpMethod.vue";
import {useNavState} from "@/utils/useNavState.ts";
import DragTabs from "@/components/ui/DragTabs.vue";
import type {Endpoint} from "@/utils/useEndpoint.ts";

const sidebar = useNavState();
const onAuxClick = (event: MouseEvent, endpoint: Endpoint) => {
    if (event.button === 1) {
        event.preventDefault();
        setTimeout(() => {
            sidebar.unselectEndpoint(endpoint)
        }, 200)
    }
}

const onMouseDown = (event: MouseEvent, endpoint: Endpoint) => {
    if (event.button == 1) {
        event.preventDefault();
        sidebar.unselectEndpoint(endpoint)
    }
}

</script>

<template>
    <DragTabs
        :items="sidebar.selectedEndpoints"
        :on-change="list => sidebar.selectedEndpoints = list"
        class="w-full flex flex-wrap overflow-x-auto  border-b border-x0 py-1">
        <template #tab="{requiredClass, item: e, i}">
            <div
                draggable="true"
                :id="e.hash"
                class="my-tab whitespace-nowrap relative group flex items-center gap-1 px-2 py-0.5 text-xs border-x-1 border-b-2 cursor-pointer border-gray-900/60 hover:bg-x3"
                :class="[
                    requiredClass,
                    sidebar.activeEndpoint?.id === e.id ? 'text-gray-900 dark:text-white border-b-green-700' : 'text-gray-700 dark:text-gray-300',
                ]"
                @click="() => sidebar.activeEndpoint = e"
                @mousedown="ev => onMouseDown(ev, e)"
                @auxclick.prevent="ev => onAuxClick(ev, e)"
            >
                <HttpMethod :method="e.method" class="text-xs tracking-tighter pointer-events-none select-none"/>
                <span class="select-none pointer-events-none">{{ e.name.replace('/api/', '') }}</span>

                <span
                    @click.stop="sidebar.unselectEndpoint(e)"
                    class="absolute right-0 items-center rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 flex transition-opacity duration-300">
                    <i class="icon icon-[mdi--close] aspect-square text-black"></i>
                </span>
            </div>
        </template>
    </DragTabs>
</template>
