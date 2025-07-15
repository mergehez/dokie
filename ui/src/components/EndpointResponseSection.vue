<script setup lang="ts">

import MonacoEditor from "@/components/MonacoEditor.vue";
import type {ApiCall} from "@/utils/useDb.ts";
import {ref} from "vue";
import ArgButton from "@/components/ui/ArgButton.vue";
import mime from 'mime';
import TabButton from "@/components/TabButton.vue";

const props = defineProps<{
    response: Exclude<ApiCall['response'], undefined>
}>()

const canCopy = 'navigator' in window && 'clipboard' in navigator;
const copied = ref<boolean>();

function copyBody() {
    navigator.clipboard.writeText(props.response.body ?? '')
        .then(() => {
            copied.value = true;
        })
        .catch((err) => {
            copied.value = false;
            console.error('Failed to copy response body:', err);
        }).finally(() => {
        setTimeout(() => {
            copied.value = undefined;
        }, 2000);
    });
}

const activeTab = ref<'body' | 'preview' | 'headers'>('body');
</script>

<template>
    <div class="flex-1 flex flex-col border  border-x4 rounded overflow-hidden">
        <div
            class="p-2 border-b border-x4 flex justify-between items-center">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Response</h3>
            <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400">Status:</span>
                    <span :class="{
                            'text-green-600': response.isSuccess,
                            'text-yellow-600': response.isRedirect,
                            'text-red-600': !response.isSuccess && !response.isRedirect
                        }">
                            {{ response.status }} {{ response.statusText }}
                        </span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400">Time:</span>
                    <span>{{ Math.round(response.duration ?? 0) }}ms</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400">Size:</span>
                    <span>{{ Math.round((response.size ?? 0) / 1024 * 100) / 100 }}KB</span>
                </div>
            </div>
        </div>
        <div class="flex flex-1">
            <!-- Left side: Response content tabs -->
            <div class="flex-1 flex flex-col border-r border-x4 w-full">
                <div class="flex border-b border-x4 items-center">
                    <TabButton v-model="activeTab" tab="body" text="Body"/>
                    <TabButton v-model="activeTab" tab="preview" text="Preview" v-if="canBeViewed()"/>
                    <TabButton v-model="activeTab" tab="headers" text="Headers"/>

                    <i class="flex-1"></i>
                    <!-- copy button if body -->
                </div>
                <div class=" flex-1 relative">
                    <MonacoEditor
                        :model-value="response.body?.replace(/\/Users\/mazlum\/Documents/g, 'file:///Users/mazlum/Documents').replace(/:line/g,':line:')"
                        readonly
                        :class="activeTab === 'body' ? '' : ' invisible'"
                    />
                    <div class="inset-0 absolute space-y-2 p-4"
                         :class="activeTab === 'headers' ? '' : 'invisible'">
                        <div v-for="(v) in response.headers" :key="v[0]"
                             class="flex">
                            <span class="font-medium min-w-[200px]">{{ v[0] }}:</span>
                            <span class="text-gray-600 dark:text-gray-400">{{ v[1] }}</span>
                        </div>
                    </div>
                    <div class="inset-0 absolute space-y-2 p-4"
                         :class="activeTab === 'preview' ? '' : 'invisible'">
                        <iframe
                            v-if="response.contentType?.startsWith('text/html')"
                            :srcdoc="response.body"
                            class="w-full h-full border border-x4 rounded overflow-hidden">
                        </iframe>
                        <div v-else class="text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                                        <span class="text-sm">
                                            Preview is only available for HTML responses. <br>
                                            But current response is: <strong>{{ response.contentType }}</strong>
                                        </span>
                        </div>
                    </div>
                    <template v-if="canCopy && activeTab === 'body'">
                        <ArgButton
                            :severity="copied === true ? 'success' : copied === false ? 'danger' : 'primary'"
                            class="absolute z-10 right-6 top-2 px-2 py-1 text-xs"
                            @click="copyBody"
                        >
                            <i class="icon icon-[ic--round-content-copy]"></i>
                            {{ copied === true ? 'Copied!' : copied === false ? 'Failed to copy, see console!' : 'Copy Body' }}
                        </ArgButton>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>