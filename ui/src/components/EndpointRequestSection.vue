<script setup lang="ts">

import {defaultPostscript} from "@/utils/usePostscript.ts";
import MonacoEditor from "@/components/MonacoEditor.vue";
import {ElOption, ElRadio, ElRadioGroup, ElScrollbar, ElSelect} from "element-plus";
import EnvDataTable from "@/components/EnvDataTable.vue";
import type {Endpoint} from "@/utils/useEndpoint.ts";
import {computed} from "vue";
import mime from "mime";
import TabButton from "@/components/TabButton.vue";

const props = defineProps<{
    endpoint: Endpoint
}>()

const req = computed(() => props.endpoint.request);

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
            <TabButton v-model="endpoint.activeRequestTab" tab="body" text="Body"/>
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
                        <EnvDataTable code="routeKeyVals" :kv-collection="endpoint.routeKeyVals"
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
                        <EnvDataTable code="queryKeyVals" :kv-collection="endpoint.queryKeyVals"
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
                    <EnvDataTable code="headerKeyVals" :kv-collection="endpoint.headerKeyVals"
                                  :on-change="endpoint.updateCurrentUrl" autocomplete/>
                </div>

                <!-- Body Tab -->
                <div v-if="endpoint.activeRequestTab === 'body'" class="space-y-2 h-full">
                    <div class="flex items-center space-x-4 px-4 py-1.5 bg-x1 border-b border-x4">
                        <div class="text-xs font-medium">Body Type:</div>
                        <ElRadioGroup v-model="endpoint.request.bodyType" size="small">
                            <ElRadio
                                v-for="item in ['json', 'xml', 'text', 'html', 'form-data'] as const"
                                :key="item"
                                :value="item"
                                class="mr-4!"
                            >{{ item }}
                            </ElRadio>
                        </ElRadioGroup>
                    </div>
                    <template v-if="endpoint.request.bodyType == 'form-data'">
                        <div class="px-2 grid gap-1">
                            <div class="flex justify-between items-center px-0.5">
                                <div class="text-sm font-medium">Form Data</div>
                                <button @click="() => endpoint.formData.addNew()"
                                        class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    Add
                                </button>
                            </div>
                            <EnvDataTable
                                code="bodyFD"
                                :kv-collection="endpoint.formData"
                                :on-change="endpoint.updateCurrentUrl"
                                autocomplete
                            >
                                <template #center="{item}">
                                    <ElSelect
                                        :model-value="item.type || 'text'"
                                        @change="v => item.type = v"
                                        style="width: 100px; height:100%;"
                                    >
                                        <ElOption label="Text" value="text"/>
                                        <ElOption label="File" value="file"/>
                                    </ElSelect>
                                </template>
                            </EnvDataTable>
                        </div>
                    </template>
                    <template v-else>
                        <MonacoEditor
                            v-model="endpoint.request.body"
                            :language="endpoint.request.bodyType"
                        />
                    </template>
                </div>

                <!-- postscript Tab -->
                <div v-if="endpoint.activeRequestTab === 'postscript'" class="space-y-2 h-full">
                    <MonacoEditor
                        :model-value="endpoint.request.postscript ?? defaultPostscript(props.endpoint)"
                        @update:modelValue="v => endpoint.request.postscript = v ?? ''"
                        language="typescript"
                    />
                </div>
            </ElScrollbar>
        </div>
    </div>
</template>

<style>
.el-radio {
    --el-radio-input-border: 1px solid #888 !important;
}

.el-radio__label {
    padding-left: 0.3rem;
}
</style>