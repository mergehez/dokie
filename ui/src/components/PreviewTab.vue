<script setup lang="ts">
import OfficePreviewer from '@/components/OfficePreviewer.vue';
import type { ApiResponse } from '@/utils/useDb.ts';
import { computed } from 'vue';

const props = defineProps<{
    response: ApiResponse;
}>();

function objectUrl(mimeType: string): string | null {
    if (!props.response.bodyArrayBuffer) return null;
    const blob = new Blob([props.response.bodyArrayBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
}

// Content types that benefit from preview (different from raw body view)
const previewHandlers: Record<string, { mime: string; template: 'iframe' | 'img' | 'audio' | 'video' | 'text' | 'office' }> = {
    html: { mime: 'text/html', template: 'iframe' },
    htm: { mime: 'text/html', template: 'iframe' },
    pdf: { mime: 'application/pdf', template: 'iframe' },
    svg: { mime: 'image/svg+xml', template: 'img' },
    png: { mime: 'image/png', template: 'img' },
    jpg: { mime: 'image/jpeg', template: 'img' },
    jpeg: { mime: 'image/jpeg', template: 'img' },
    gif: { mime: 'image/gif', template: 'img' },
    webp: { mime: 'image/webp', template: 'img' },
    bmp: { mime: 'image/bmp', template: 'img' },
    ico: { mime: 'image/x-icon', template: 'img' },
    mp3: { mime: 'audio/mpeg', template: 'audio' },
    wav: { mime: 'audio/wav', template: 'audio' },
    ogg: { mime: 'audio/ogg', template: 'audio' },
    aac: { mime: 'audio/aac', template: 'audio' },
    flac: { mime: 'audio/flac', template: 'audio' },
    mp4: { mime: 'video/mp4', template: 'video' },
    webm: { mime: 'video/webm', template: 'video' },
    avi: { mime: 'video/x-msvideo', template: 'video' },
    mov: { mime: 'video/quicktime', template: 'video' },
    txt: { mime: 'text/plain', template: 'text' },
    csv: { mime: 'text/csv', template: 'office' },
    xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', template: 'office' },
    xls: { mime: 'application/vnd.ms-excel', template: 'office' },
};

const ext = computed(() => props.response.ext);
const handler = computed(() => previewHandlers[ext.value || '']);

const previewUrl = computed(() => {
    if (!handler.value) return null;
    if (handler.value.template === 'iframe' && (ext.value === 'html' || ext.value === 'htm')) {
        return null; // use srcdoc instead
    }
    return objectUrl(handler.value.mime);
});

const srcdoc = computed(() => {
    if (ext.value === 'html' || ext.value === 'htm') {
        return props.response.bodyStr;
    }
    return undefined;
});

const supportedTypes = computed(() =>
    Object.keys(previewHandlers)
        .filter((k) => k !== 'htm' && k !== 'jpeg') // aliases, skip duplicates
        .sort()
        .map((k) => `<strong>${k}</strong>`)
        .join(', ')
);
</script>

<template>
    <div class="inset-0 absolute space-y-2 p-4 flex overflow-auto">
        <!-- HTML: render via srcdoc -->
        <iframe v-if="handler?.template === 'iframe' && srcdoc" :srcdoc="srcdoc" class="w-full h-full border border-x4 rounded overflow-hidden"></iframe>

        <!-- PDF: render via blob URL -->
        <iframe v-else-if="handler?.template === 'iframe' && previewUrl" :src="previewUrl" class="w-full h-full border border-x4 rounded overflow-hidden"></iframe>

        <!-- Images -->
        <img v-else-if="handler?.template === 'img' && previewUrl" :src="previewUrl" class="max-w-full max-h-full object-contain mx-auto" :alt="'Preview: ' + ext" />

        <!-- Audio -->
        <audio v-else-if="handler?.template === 'audio' && previewUrl" :src="previewUrl" controls class="w-full self-center"></audio>

        <!-- Video -->
        <video v-else-if="handler?.template === 'video' && previewUrl" :src="previewUrl" controls class="max-w-full max-h-full mx-auto"></video>

        <!-- Plain text -->
        <pre v-else-if="handler?.template === 'text'" class="w-full h-full overflow-auto text-sm whitespace-pre-wrap font-mono">{{ response.bodyStr }}</pre>

        <!-- Office documents (Excel, Word, PowerPoint) -->
        <OfficePreviewer v-else-if="handler?.template === 'office'" :response="response" />

        <!-- Unsupported -->
        <div v-else class="text-gray-500 dark:text-gray-400 h-full w-full flex items-center justify-center">
            <div class="text-sm text-center leading-relaxed max-w-[80%] flex flex-col">
                <div>
                    No preview available for <b>{{ response.contentType }}</b>
                </div>
                <div>Use the <strong>Body</strong> tab to view the raw content.</div>
                <div class="mt-5">
                    Supported types: <br />
                    <span v-html="supportedTypes"></span>.
                </div>
            </div>
        </div>
    </div>
</template>
