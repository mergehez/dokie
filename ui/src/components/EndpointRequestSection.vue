<script setup lang="ts">

import {defaultPostscript} from "@/utils/usePostscript.ts";
import MonacoEditor from "@/components/MonacoEditor.vue";
import {ElScrollbar} from "element-plus";
import EnvDataTable from "@/components/EnvDataTable.vue";
import type {Endpoint} from "@/utils/useEndpoint.ts";
import {computed} from "vue";
import mime from "mime";
import TabButton from "@/components/TabButton.vue";

const props = defineProps<{
    endpoint: Endpoint
}>()

const req = computed(() => props.endpoint.apiCall.request);

function getHeader(name: string): string | undefined {
    return Object.entries(req.value.headers).find(t => t[0].toLowerCase() === name.toLowerCase())?.[1];
}

const ext = computed(() => mime.getExtension(getHeader('Content-Type') || 'application/json') || 'json');
</script>

<template>
    <div class="flex-1 flex flex-col border border-x4 rounded overflow-y-auto">
        <div class="flex border-b border-x4">
            <TabButton v-model="endpoint.activeRequestTab" tab="params" text="Params"/>
            <TabButton v-model="endpoint.activeRequestTab" tab="headers" text="Headers"/>
            <TabButton v-model="endpoint.activeRequestTab" tab="body" :text="`Body (${ext})`"/>
            <TabButton v-model="endpoint.activeRequestTab" tab="postscript" text="Postscript"/>
        </div>

        <div class="py-1 flex-1 overflow-y-auto">
            <ElScrollbar class="h-full w-full overflow-y-auto" view-class="h-full">
                <!-- Params Tab -->
                <div v-if="endpoint.activeRequestTab === 'params'" class="space-y-6 p-4 h-full">
                    <!-- Route Parameters Section -->
                    <div v-if="endpoint.routeKeyVals.keyVals.length > 0" class="space-y-4">
                        <div class="flex items-center">
                            <div class="text-sm font-medium">Route Parameters</div>
                        </div>
                        <EnvDataTable :kv-collection="endpoint.routeKeyVals"
                                      :on-change="endpoint.updateCurrentUrl" autocomplete/>
                        <hr class="border-x4"/>
                    </div>

                    <!-- Query Parameters Section -->
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <div class="text-sm font-medium italic opacity-80">Query Parameters</div>
                            <button @click="() => endpoint.queryKeyVals.addNew()"
                                    class="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                <i class="icon icon-[mdi--plus]"></i>
                                Add
                            </button>
                        </div>
                        <EnvDataTable :kv-collection="endpoint.queryKeyVals"
                                      :on-change="endpoint.updateCurrentUrl" autocomplete/>
                    </div>
                </div>

                <!-- Headers Tab -->
                <div v-if="endpoint.activeRequestTab === 'headers'" class="space-y-4 p-4 h-full">
                    <div class="flex justify-between items-center">
                        <div class="text-sm font-medium">Request Headers</div>
                        <button @click="() => endpoint.headerKeyVals.addNew()"
                                class="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Add Header
                        </button>
                    </div>
                    <EnvDataTable :kv-collection="endpoint.headerKeyVals"
                                  :on-change="endpoint.updateCurrentUrl" autocomplete/>
                </div>

                <!-- Body Tab -->
                <div v-if="endpoint.activeRequestTab === 'body'" class="space-y-2 h-full">
                    <MonacoEditor
                        v-model="props.endpoint.apiCall.request.body"
                        :language="ext"
                    />
                </div>

                <!-- postscript Tab -->
                <div v-if="endpoint.activeRequestTab === 'postscript'" class="space-y-2 h-full">
                    <MonacoEditor
                        :model-value="props.endpoint.apiCall.request.postscript ?? defaultPostscript(props.endpoint)"
                        @update:modelValue="v => props.endpoint.apiCall.request.postscript = v ?? ''"
                        language="typescript"
                    />
                </div>
            </ElScrollbar>
        </div>
    </div>
</template>

<style scoped>

</style>