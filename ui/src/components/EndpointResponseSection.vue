<script setup lang="ts">
import AceEditor from '@/components/AceEditor.vue';
import PreviewTab from '@/components/PreviewTab.vue';
import TabButton from '@/components/TabButton.vue';
import ArgButton from '@/components/ui/ArgButton.vue';
import type { ApiResponse } from '@/utils/useDb.ts';
import type { Endpoint } from '@/utils/useEndpoint.ts';
import mime from 'mime';
import { computed, ref } from 'vue';

const props = defineProps<{
    endpoint: Endpoint;
    response: ApiResponse;
}>();

const canCopy = 'navigator' in window && 'clipboard' in navigator;
const copied = ref<boolean>();

function copyBody() {
    navigator.clipboard
        .writeText(props.response.bodyStr ?? '')
        .then(() => {
            copied.value = true;
        })
        .catch((err) => {
            copied.value = false;
            console.error('Failed to copy response body:', err);
        })
        .finally(() => {
            setTimeout(() => {
                copied.value = undefined;
            }, 2000);
        });
}

// Body tab: show editor only for text-based content
const textExts = ['txt', 'json', 'xml', 'html', 'htm', 'csv', 'yaml', 'yml', 'md', 'log', 'env'];

function canShowInEditor(): boolean {
    return props.response.ext ? textExts.includes(props.response.ext) : false;
}

// Preview tab: media types that browsers can natively render
const previewExts = [
    'html',
    'htm',
    'pdf',
    'svg',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'bmp',
    'ico',
    'mp3',
    'wav',
    'ogg',
    'aac',
    'flac',
    'mp4',
    'webm',
    'avi',
    'mov',
    'txt',
    'csv',
    'xlsx',
    'xls',
];

function canShowInPreview(): boolean {
    return props.response.ext ? previewExts.includes(props.response.ext) : false;
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
    const ab = props.response.bodyArrayBuffer;

    if (!ab) {
        console.error('No body data available for download');
        return;
    }
    if (ext === 'xls' || ext === 'xlsx') {
        ext = 'xlsx'; // Ensure we use a consistent extension for Excel files
    }
    const blob = new Blob([ab], { type: props.response.contentType });
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

const statusCodeNames: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    428: 'Too Many Requests',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
};
const statusText = computed(() => {
    return props.response.statusText || statusCodeNames[props.response.status] || '';
});
</script>

<template>
    <div class="flex-1 flex flex-col border border-x4 rounded overflow-hidden relative">
        <div class="p-2 border-b border-x4 flex justify-between items-center">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">Response</h3>
            <div class="flex items-center gap-1 lg:gap-2 xl:gap-3 2xl:gap-4 text-sm">
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400">Status:</span>
                    <span
                        class="line-clamp-1"
                        :class="{
                            'text-green-600': response.isSuccess,
                            'text-yellow-600': response.isRedirect,
                            'text-red-600': !response.isSuccess && !response.isRedirect,
                        }"
                    >
                        {{ response.status }} {{ statusText }}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400">Time:</span>
                    <span>{{ Math.round(response.duration ?? 0) }}ms</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400">Size:</span>
                    <span class="whitespace-nowrap">{{ sizeToString(response.size) }}</span>
                </div>
            </div>
        </div>
        <div class="flex flex-1">
            <!-- Left side: Response content tabs -->
            <div class="flex-1 flex flex-col border-r border-x4 w-full">
                <div class="flex border-b border-x4 items-center">
                    <TabButton v-model="activeTab" tab="body" text="Body" />
                    <TabButton v-model="activeTab" tab="preview" text="Preview" />
                    <TabButton v-model="activeTab" tab="headers" text="Headers" />

                    <i class="flex-1"></i>

                    <ArgButton severity="secondary" class="z-10 px-2 py-1 text-xs" @click="downloadResponse">
                        <i class="icon icon-[mdi--content-save]"></i>
                        Download Response ({{ response.ext || 'txt' }})
                    </ArgButton>
                    <!-- copy button if body -->
                </div>
                <div class="flex-1 relative">
                    <AceEditor
                        v-if="activeTab === 'body' && canShowInEditor()"
                        :model-value="response.bodyStr?.replace(/:line/g, ':line:')"
                        readonly
                        :language="response.ext || 'json'"
                    />
                    <div v-if="activeTab === 'body' && !canShowInEditor()" class="inset-0 absolute space-y-2 p-4 flex flex-col items-center justify-center">
                        <div class="text-center">
                            <u
                                ><b>{{ response.ext || response.contentType }}</b></u
                            >
                            files cannot be displayed in the editor.
                        </div>

                        <div class="flex gap-2">
                            <ArgButton severity="secondary" class="px-2 py-1 text-xs" @click="downloadResponse">
                                <i class="icon icon-[mdi--content-save]"></i>
                                Download Response ({{ sizeToString(response.size) }})
                            </ArgButton>
                            <ArgButton v-if="canShowInPreview()" severity="primary" class="px-2 py-1 text-xs" @click="activeTab = 'preview'">
                                <i class="icon icon-[mdi--eye]"></i>
                                Go to Preview Tab
                            </ArgButton>
                        </div>
                    </div>
                    <div class="inset-0 absolute space-y-2 p-4" :class="activeTab === 'headers' ? '' : 'invisible'">
                        <div v-for="v in response.headers" :key="v[0]" class="flex">
                            <span class="font-medium min-w-[200px]">{{ v[0] }}:</span>
                            <span class="text-gray-600 dark:text-gray-400">{{ v[1] }}</span>
                        </div>
                    </div>
                    <PreviewTab v-if="activeTab === 'preview'" :response="response" />
                    <template v-if="canCopy && activeTab === 'body' && canShowInEditor()">
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

        <div v-if="endpoint.isSending" class="bg-x1/60 absolute inset-0 grid place-items-center">
            <i class="icon icon-[mingcute--loading-fill] animate-spin text-5xl"></i>
        </div>
    </div>
</template>
