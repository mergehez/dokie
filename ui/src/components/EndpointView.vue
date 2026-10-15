<script setup lang="ts">
import { type Endpoint } from '@/utils/useEndpoint.ts';
import HttpMethod from '@/components/HttpMethod.vue';
import SplitterVertical from '@/components/ui/SplitterVertical.vue';
import ArgButton from '@/components/ui/ArgButton.vue';
import { ElDialog, ElInput, ElOption, ElSelect } from 'element-plus';
import AutocompleteText from '@/components/ui/AutocompleteText.vue';
import { sendRequest } from '@/utils/sendRequest.ts';
import EndpointRequestSection from '@/components/EndpointRequestSection.vue';
import EndpointResponseSection from '@/components/EndpointResponseSection.vue';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    endpoint: Endpoint;
}>();

const isMissingRequiredValue = computed(() => props.endpoint.axiosError?.code === 'ERR_MISSING_REQUIRED_VALUE');
const errorDialogVisible = ref(false);

watch(
    () => props.endpoint.axiosError,
    (error) => {
        errorDialogVisible.value = Boolean(error);
    },
    { immediate: true }
);

function clearEndpointError() {
    props.endpoint.axiosError = undefined;
}

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
</script>

<template>
    <div class="flex-1 flex flex-col p-4 rounded-lg shadow overflow-y-auto bg-x0">
        <SplitterVertical base-panel="top" default-height="30%" min-height="200px" max-height="calc(100% - 200px)" local-storage-key="endpoint-view-splitter">
            <template #top>
                <!-- Request Controls -->
                <div v-if="endpoint.isCustom" class="w-full flex gap-2 items-center">
                    <ElInput v-model="endpoint.name" class="">
                        <template #prepend>Name</template>
                    </ElInput>
                </div>
                <div class="flex gap-2 items-center">
                    <div>
                        <ElSelect v-model="endpoint.request.method">
                            <template #prefix>
                                <HttpMethod :method="endpoint.request.method" />
                            </template>
                            <ElOption v-for="ws in httpMethods" :key="ws" :label="ws" :value="ws">
                                <HttpMethod :method="ws" full-name />
                            </ElOption>
                        </ElSelect>
                    </div>

                    <div class="flex-1 relative">
                        <!--<AutocompleteText-->
                        <!--    v-model="endpoint.request.url"-->
                        <!--    class="w-full"-->
                        <!--    input-style="width: 100%;"-->
                        <!--    placeholder="URL"/>-->
                        <AutocompleteText v-model="endpoint.request.url" class="w-full" input-style="width: 100%;" placeholder="URL" />
                    </div>

                    <ArgButton severity="primary" small @click="sendRequest(endpoint)" :loading="endpoint.isSending" class="gap-2">
                        <i v-if="!endpoint.isSending" class="icon icon-[mdi--send]"></i>
                        <span>Send</span>
                    </ArgButton>
                </div>

                <div v-if="endpoint.description || endpoint.summary" class="text-xs opacity-70 pl-1">
                    <span class="opacity-80 pr-1">Description:</span>
                    <span class="font-bold italic">{{ endpoint.description || endpoint.summary }}</span>
                </div>

                <!-- Request Configuration Tabs -->
                <EndpointRequestSection :endpoint="endpoint" />
            </template>
            <template #bottom>
                <!-- Response Section -->
                <EndpointResponseSection v-if="endpoint.response" :endpoint="endpoint" :response="endpoint.response" />
                <div v-else class="border border-x4 rounded p-4 text-sm text-gray-500 dark:text-gray-400">No response yet</div>
            </template>
        </SplitterVertical>

        <ElDialog
            v-model="errorDialogVisible"
            :title="isMissingRequiredValue ? 'Request not sent' : 'Request error'"
            width="min(32rem, calc(100vw - 2rem))"
            append-to-body
            @close="clearEndpointError"
        >
            <div class="flex flex-col gap-2 text-sm">
                <p>{{ endpoint.axiosError?.message || 'An unexpected error prevented the request.' }}</p>
                <p v-if="isMissingRequiredValue" class="text-xs opacity-80">Fill in the required value or provide a non-empty variable in the sidebar, then try again.</p>
            </div>
            <template #footer>
                <ArgButton severity="primary" small @click="errorDialogVisible = false">Close</ArgButton>
            </template>
        </ElDialog>
    </div>
</template>

<style>
.vjs-carets {
    transform: translateY(-40%);
}

.el-input-group__prepend {
    padding: 0 5px;
}
</style>
