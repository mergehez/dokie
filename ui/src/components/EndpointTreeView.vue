<script setup lang="ts">
import HttpMethod from './HttpMethod.vue';
import {CustomEndpointsTag, useNavState} from "@/utils/useNavState.ts";
import {ElPopconfirm, ElScrollbar} from "element-plus";
import {sendRequest} from "@/utils/sendRequest.ts";
import ArgButton from "@/components/ui/ArgButton.vue";

defineProps<{
    query: string
}>()

const sidebar = useNavState();
</script>

<template>
    <div class="space-y-2 flex-1 overflow-y-auto ">
        <ElScrollbar view-class="w-full h-full">
            <div v-for="(endpoints, tag) in sidebar.groupedEndpoints" :key="tag" class="group">
                <div @click="sidebar.toggleGroup(tag)"
                     class="flex items-center gap-2 px-2 rounded cursor-pointer hover:bg-x2 transition-colors select-none">
                    <i class="icon opacity-80" :class="sidebar.isGroupExpanded(tag) ? 'icon-[mingcute--down-fill]': 'icon-[mingcute--right-fill]'"></i>
                    <span class="font-bold text-gray-700 dark:text-gray-300 capitalize">{{ tag == CustomEndpointsTag ? 'Custom Endpoints' : tag }}</span>
                    <template v-if="tag === CustomEndpointsTag">
                        <ArgButton severity="info" icon-only icon="icon-[mingcute--add-fill]" class="p-px" @click.prevent.stop="sidebar.addCustomEndpoint()"/>
                    </template>
                </div>
                <div v-show="sidebar.isGroupExpanded(tag)" class="space-y-1 mt-1 pr-2 pb-3">
                    <template v-for="endpoint in endpoints" :key="endpoint.hash">
                        <div
                            v-if="!query || (endpoint.method+' '+endpoint.path).toLowerCase().includes(query.toLowerCase())"
                            @click="sidebar.selectEndpoint(endpoint)"
                            class="flex text-xs items-center gap-2 p-1 pl-4 rounded cursor-pointer relative"
                            :class="{
                            'bg-blue-50 dark:bg-green-900': sidebar.activeEndpoint === endpoint,
                            'hover:bg-x2': sidebar.activeEndpoint !== endpoint
                        }">
                            <HttpMethod :method="endpoint.method"/>
                            <span class="font-mono truncate">{{ endpoint.name.replace('/api/', '/') }}</span>

                            <ElPopconfirm
                                v-if="endpoint.isCustom"
                                icon=""
                                :title="`Are you sure you want to delete the custom endpoint '${endpoint.name}'? This action cannot be undone!`"
                                placement="right"
                                width="300px"
                                @confirm="sidebar.deleteCustomEndpoint(endpoint)"
                            >
                                <template #actions="{confirm, cancel}">
                                    <div class=" flex items-center gap-2 justify-end">
                                        <ArgButton severity="secondary" class="py-0.5! px-2 gap-1" @click.prevent.stop="cancel">
                                            Cancel
                                        </ArgButton>
                                        <ArgButton severity="danger" class="py-0.5! px-2 gap-1" @click.prevent.stop="confirm">
                                            <i class="icon icon-[mingcute--delete-2-fill]"></i>
                                            Yes, delete
                                        </ArgButton>
                                    </div>
                                </template>
                                <template #reference>
                                    <span class="ml-auto inline-flex items-center">
                                        <i class="icon icon-[mi--delete] text-red-500 text-base"></i>
                                    </span>
                                </template>
                            </ElPopconfirm>
                            <span class=" inline-flex items-center" @click.prevent.stop="sendRequest(endpoint)" :class="endpoint.isCustom ? '' : 'ml-auto'">
                                <i v-if="endpoint.isSending" class="icon icon-[mingcute--loading-fill] animate-spin text-green-500 text-base"></i>
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
                    </template>
                </div>
            </div>
        </ElScrollbar>
    </div>
</template>