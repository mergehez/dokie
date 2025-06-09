<script setup lang="ts">
import {type Endpoint} from '@/utils/useEndpoint.ts'
import EnvDataTable from './EnvDataTable.vue'
import MonacoEditor from "@/components/MonacoEditor.vue";
import HttpMethod from "@/components/HttpMethod.vue";
import {useNavState} from "@/utils/useNavState.ts";
import SplitterVertical from "@/components/ui/SplitterVertical.vue";
import ArgButton from "@/components/ui/ArgButton.vue";
import {ElOption, ElScrollbar, ElSelect} from "element-plus";
import AutocompleteText from "@/components/ui/AutocompleteText.vue";
import {defaultPostscript} from "@/utils/usePostscript.ts";
import {sendRequest} from "@/utils/sendRequest.ts";
import {ref} from "vue";


const props = defineProps<{
    endpoint: Endpoint
}>()

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const navState = useNavState();

const showNewHeader = ref(false);

function copyBody() {

}
</script>

<template>

    <div class="flex-1 flex flex-col p-4  rounded-lg shadow overflow-y-auto bg-x0">
        <SplitterVertical
            :default-height="30"
            local-storage-key="endpoint-view-splitter"
        >
            <template #top>
                <!-- Request Controls -->
                <div class="flex gap-2 items-center">
                    <div>
                        <ElSelect v-model="endpoint.requestInstance.request.method">
                            <template #prefix>
                                <HttpMethod :method="endpoint.requestInstance.request.method"/>
                            </template>
                            <ElOption v-for="ws in httpMethods" :key="ws" :label="ws" :value="ws">
                                <HttpMethod :method="ws" full-name/>
                            </ElOption>
                        </ElSelect>
                    </div>

                    <div class="flex-1 relative">
                        <AutocompleteText
                            v-model="endpoint.requestInstance.request.url"
                            class="w-full"
                            input-style="width: 100%;"
                            placeholder="URL"/>
                    </div>

                    <ArgButton severity="primary" small @click="sendRequest(endpoint)" :loading="endpoint.isLoading" class="gap-2">
                        <i v-if="!endpoint.isLoading" class="icon icon-[mdi--send]"></i>
                        <span>Send</span>
                    </ArgButton>
                </div>

                <div v-if="endpoint.description" class="text-xs opacity-70 pl-1">
                    <span class="opacity-80 pr-1">Description:</span>
                    <span class="font-bold italic">{{ endpoint.description }}</span>
                </div>

                <!-- Request Configuration Tabs -->
                <div class="flex-1 flex flex-col border border-x4 rounded overflow-y-auto">
                    <div class="flex border-b border-x4">
                        <button v-for="tab in ['params', 'headers', 'body', 'postscript'] as const" :key="tab" @click="endpoint.activeRequestTab = tab"
                                class="px-4 py-2 text-sm font-medium transition-colors" :class="{
                        'border-b-2 border-blue-600 text-blue-600': endpoint.activeRequestTab === tab,
                        'text-gray-600 dark:text-gray-400': endpoint.activeRequestTab !== tab
                    }">
                            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                        </button>
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
                                    v-model="props.endpoint.requestInstance.request.body"
                                />
                            </div>

                            <!-- postscript Tab -->
                            <div v-if="endpoint.activeRequestTab === 'postscript'" class="space-y-2 h-full">
                                <MonacoEditor
                                    :model-value="props.endpoint.requestInstance.request.postscript ?? defaultPostscript(props.endpoint)"
                                    @update:modelValue="v => props.endpoint.requestInstance.request.postscript = v ?? ''"
                                    language="typescript"
                                />
                            </div>
                        </ElScrollbar>
                    </div>
                </div>
            </template>
            <template #bottom>
                <!-- Response Section -->
                <div class="flex-1 flex flex-col border  border-x4 rounded overflow-hidden" v-if="props.endpoint.requestInstance?.response">
                    <div
                        class="p-2 border-b border-x4 flex justify-between items-center">
                        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Response</h3>
                        <div class="flex items-center gap-4 text-sm">
                            <div class="flex items-center gap-2">
                                <span class="text-gray-500 dark:text-gray-400">Status:</span>
                                <span :class="{
                            'text-green-600': endpoint.requestInstance?.response?.isSuccess,
                            'text-yellow-600': endpoint.requestInstance?.response?.isRedirect,
                            'text-red-600': !endpoint.requestInstance?.response?.isSuccess && !endpoint.requestInstance?.response?.isRedirect
                        }">
                            {{ endpoint.requestInstance?.response?.status }} {{ endpoint.requestInstance?.response?.statusText }}
                        </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-gray-500 dark:text-gray-400">Time:</span>
                                <span>{{ Math.round(endpoint.requestInstance?.response?.duration ?? 0) }}ms</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-gray-500 dark:text-gray-400">Size:</span>
                                <span>{{ Math.round((endpoint.requestInstance?.response?.size ?? 0) / 1024 * 100) / 100 }}KB</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-1">
                        <!-- Left side: Response content tabs -->
                        <div class="flex-1 flex flex-col border-r border-x4 w-full">
                            <div class="flex border-b border-x4 items-center">
                                <button v-for="tab in ['body', 'preview', 'headers'] as const" :key="tab" @click="endpoint.activeResponseTab = tab"
                                        class="px-4 py-2 text-sm font-medium transition-colors" :class="{
                                'border-b-2 border-blue-600 text-blue-600': endpoint.activeResponseTab === tab,
                                'text-gray-600 dark:text-gray-400': endpoint.activeResponseTab !== tab
                            }">
                                    {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                                </button>
                                <i class="flex-1"></i>
                                <!-- copy button if body -->
                            </div>
                            <div class=" flex-1 relative">
                                <MonacoEditor
                                    :model-value="endpoint.requestInstance.response!.body?.replace(/\/Users\/mazlum\/Documents/g, 'file:///Users/mazlum/Documents').replace(/:line/g,':line:')"
                                    readonly
                                    :class="endpoint.activeResponseTab === 'body' ? '' : ' invisible'"
                                />
                                <div class="inset-0 absolute space-y-2 p-4"
                                     :class="endpoint.activeResponseTab === 'headers' ? '' : 'invisible'">
                                    <div v-for="(v) in endpoint.requestInstance!.response!.headers" :key="v[0]"
                                         class="flex">
                                        <span class="font-medium min-w-[200px]">{{ v[0] }}:</span>
                                        <span class="text-gray-600 dark:text-gray-400">{{ v[1] }}</span>
                                    </div>
                                </div>
                                <div class="inset-0 absolute space-y-2 p-4"
                                     :class="endpoint.activeResponseTab === 'preview' ? '' : 'invisible'">
                                    <iframe
                                        v-if="endpoint.requestInstance.response?.contentType?.startsWith('text/html')"
                                        :srcdoc="endpoint.requestInstance.response?.body"
                                        class="w-full h-full border border-x4 rounded overflow-hidden">
                                    </iframe>
                                    <div v-else class="text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                                        <span class="text-sm">
                                            Preview is only available for HTML responses. <br>
                                            But current response is: <strong>{{ endpoint.requestInstance.response?.contentType }}</strong>
                                        </span>
                                    </div>
                                </div>
                                <button v-if="endpoint.activeResponseTab === 'body'" @click="copyBody"
                                        class="absolute z-10 right-8 top-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="endpoint.axiosError"
                     class="flex-1 flex flex-col border border-red-200 dark:border-red-700 rounded p-4 text-sm text-red-500 dark:text-red-400 overflow-y-auto">
            <pre
                class=""
            >Axios Error:<br/><br/>{{
                    JSON.stringify(endpoint.axiosError, null, 2)
                }}</pre>
                </div>
                <div v-else
                     class="border border-x4 rounded p-4 text-sm text-gray-500 dark:text-gray-400">
                    No response yet
                </div>
            </template>
        </SplitterVertical>
    </div>
</template>

<style>
.vjs-carets {
    transform: translateY(-40%);
}
</style>