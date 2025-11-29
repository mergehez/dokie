<script setup lang="ts">
import HttpMethod from './HttpMethod.vue';
import {useNavState} from "@/utils/useNavState.ts";
import {ElScrollbar} from "element-plus";
import {sendRequest} from "@/utils/sendRequest.ts";

const sidebar = useNavState();
</script>

<template>
    <div class="space-y-2 flex-1 overflow-y-auto ">
        <ElScrollbar view-class="w-full h-full">
            <div v-for="(endpoints, tag) in sidebar.groupedEndpoints" :key="tag" class="group">
                <div @click="sidebar.toggleGroup(tag)"
                     class="flex items-center gap-2 px-2 rounded cursor-pointer hover:bg-x2 transition-colors select-none">
                    <i class="icon opacity-80" :class="sidebar.isGroupExpanded(tag) ? 'icon-[mingcute--down-fill]': 'icon-[mingcute--right-fill]'"></i>
                    <span class="font-bold text-gray-700 dark:text-gray-300 capitalize">{{ tag }}</span>
                </div>
                <div v-show="sidebar.isGroupExpanded(tag)" class="space-y-1 mt-1 pr-2 pb-3">
                    <div
                        v-for="endpoint in endpoints" :key="`${endpoint.method}-${endpoint.path}`"
                        @click="sidebar.selectEndpoint(endpoint)"
                        class="flex text-xs items-center gap-2 p-1 pl-4 rounded cursor-pointer relative"
                        :class="{
                        'bg-blue-50 dark:bg-green-900': sidebar.activeEndpoint === endpoint,
                        'hover:bg-x2': sidebar.activeEndpoint !== endpoint
                    }">
                        <HttpMethod :method="endpoint.method"/>
                        <span class="font-mono truncate">{{ endpoint.path.replace('/api/', '/') }}</span>
                        <span class="ml-auto inline-flex items-center" @click.prevent.stop="sendRequest(endpoint)">
                        <i v-if="endpoint.isLoading" class="icon icon-[mingcute--loading-fill] animate-spin text-green-500 text-base"></i>
                        <i v-else-if="endpoint.recentlyFailed" class="icon icon-[icon-park-solid--error] text-red-500 text-base"></i>
                        <i v-else-if="endpoint.recentlySucceeded" class="icon icon-[mdi--check-circle] text-green-500 text-base"></i>
                        <i v-else class="icon icon-[mdi--play] text-green-500 text-base"></i>
                    </span>
                        <span class=" inline-flex items-center" @click.prevent.stop="sidebar.toggleFav(endpoint)">
                        <i
                            v-if="sidebar.isFav(endpoint)"
                            class="icon icon-[mdi--star] text-yellow-400 text-base"></i>
                        <i v-else class="icon icon-[mdi--star-outline] text-yellow-500/40 text-base"></i>
                    </span>
                    </div>
                </div>
            </div>
        </ElScrollbar>
    </div>
</template>