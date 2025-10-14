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
    navigator.clipboard.writeText(props.response.bodyStr ?? '')
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

function canBeViewed(): boolean {
    const viewableExts = ['txt', 'json', 'html', 'htm', 'xml', 'csv', 'pdf'];
    return props.response.ext ? viewableExts.includes(props.response.ext) : false;
}

function sizeToString(size: number): string {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function downloadResponse() {
    let ext = mime.getExtension(props.response.contentType) || 'txt'; // Use mime-types to get the extension
    const ab = props.response.bodyArrayBuffer

    if (!ab) {
        console.error('No body data available for download');
        return;
    }
    if (ext === 'xls' || ext === 'xlsx') {
        ext = 'xlsx'; // Ensure we use a consistent extension for Excel files
    }
    const blob = new Blob([ab], {type: props.response.contentType});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const dt = new Date().toISOString().split('.')[0]!.replace(/[:T]/g, '-'); // Format date for filename
    a.download = `response-${dt}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                    <span>{{ sizeToString(response.size) }}</span>
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

                    <ArgButton
                        severity="secondary"
                        class="z-10 px-2 py-1 text-xs"
                        @click="downloadResponse"
                    >
                        <i class="icon icon-[mdi--content-save]"></i>
                        Download Response ({{ response.ext || 'txt' }})
                    </ArgButton>
                    <!-- copy button if body -->
                </div>
                <div class=" flex-1 relative">
                    <MonacoEditor
                        :model-value="response.bodyStr?.replace(/:line/g,':line:')"
                        readonly
                        :language="response.ext || 'json'"
                        :class="activeTab === 'body' && canBeViewed() ? '' : ' invisible'"
                    />
                    <div
                        :class="activeTab === 'body' && !canBeViewed() ? '' : 'invisible'"
                        class="inset-0 absolute space-y-2 p-4 flex flex-col items-center justify-center">
                        <div class="text-center">
                            <u><b>{{ response.ext || response.contentType }}</b></u> files cannot be displayed in the editor.
                        </div>

                        <ArgButton
                            severity="secondary"
                            class="z-10 px-2 py-1 text-xs"
                            @click="downloadResponse"
                        >
                            <i class="icon icon-[mdi--content-save]"></i>
                            Download Response ({{ sizeToString(response.size) }})
                        </ArgButton>
                    </div>
                    <div class="inset-0 absolute space-y-2 p-4"
                         :class="activeTab === 'headers' ? '' : 'invisible'">
                        <div v-for="(v) in response.headers" :key="v[0]"
                             class="flex">
                            <span class="font-medium min-w-[200px]">{{ v[0] }}:</span>
                            <span class="text-gray-600 dark:text-gray-400">{{ v[1] }}</span>
                        </div>
                    </div>
                    <div class="inset-0 absolute space-y-2 p-4 flex overflow-auto"
                         :class="activeTab === 'preview' ? '' : 'invisible'">
                        <iframe
                            v-if="response.ext == 'html' || response.ext == 'htm'"
                            :srcdoc="response.bodyStr"
                            class="w-full h-full border border-x4 rounded overflow-hidden">
                        </iframe>
                        <div v-else class="text-gray-500 dark:text-gray-400 h-full w-full flex items-center justify-center">
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