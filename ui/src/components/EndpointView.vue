<script setup lang="ts">
import {type Endpoint} from '@/utils/useEndpoint.ts'
import HttpMethod from "@/components/HttpMethod.vue";
import SplitterVertical from "@/components/ui/SplitterVertical.vue";
import ArgButton from "@/components/ui/ArgButton.vue";
import {ElOption, ElSelect} from "element-plus";
import AutocompleteText from "@/components/ui/AutocompleteText.vue";
import {sendRequest} from "@/utils/sendRequest.ts";
import EndpointRequestSection from "@/components/EndpointRequestSection.vue";
import EndpointResponseSection from "@/components/EndpointResponseSection.vue";

const props = defineProps<{
    endpoint: Endpoint
}>()

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
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
                        <ElSelect v-model="endpoint.request.method">
                            <template #prefix>
                                <HttpMethod :method="endpoint.request.method"/>
                            </template>
                            <ElOption v-for="ws in httpMethods" :key="ws" :label="ws" :value="ws">
                                <HttpMethod :method="ws" full-name/>
                            </ElOption>
                        </ElSelect>
                    </div>

                    <div class="flex-1 relative">
                        <AutocompleteText
                            v-model="endpoint.request.url"
                            class="w-full"
                            input-style="width: 100%;"
                            placeholder="URL"/>
                    </div>

                    <ArgButton severity="primary" small @click="sendRequest(endpoint)" :loading="endpoint.isLoading" class="gap-2">
                        <i v-if="!endpoint.isLoading" class="icon icon-[mdi--send]"></i>
                        <span>Send</span>
                    </ArgButton>
                </div>

                <div v-if="endpoint.description || endpoint.summary" class="text-xs opacity-70 pl-1">
                    <span class="opacity-80 pr-1">Description:</span>
                    <span class="font-bold italic">{{ endpoint.description || endpoint.summary }}</span>
                </div>

                <!-- Request Configuration Tabs -->
                <EndpointRequestSection :endpoint="endpoint"/>
            </template>
            <template #bottom>
                <!-- Response Section -->
                <EndpointResponseSection
                    v-if="endpoint.response"
                    :response="endpoint.response"
                />
                <div v-else-if="endpoint.axiosError"
                     class="flex-1 flex flex-col border border-red-200 dark:border-red-700 rounded p-4 text-sm text-red-500 dark:text-red-400 overflow-y-auto">
                    <pre
                        class=""
                    >CLIENT ERROR <br/>This error is not from the API. <br/>Check DevTools for more info! <br/><br/>{{
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