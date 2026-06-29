<script setup lang="ts">
import type { ApiResponse } from '@/utils/useDb.ts';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
    response: ApiResponse;
}>();

const containerRef = ref<HTMLDivElement>();
let viewerInstance: any = null;

const CDN = 'https://unpkg.com/excel-viewer@1.0.0/dist';

function loadCss(): Promise<void> {
    return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${CDN}/excel/xspreadsheet.css`;
        link.onload = () => resolve();
        document.head.appendChild(link);
    });
}

function loadScripts(): Promise<void> {
    const urls = [`${CDN}/excel/xspreadsheet.js`, `${CDN}/excel/xlsx.full.min.js`, `${CDN}/excel-viewer.js`];
    return urls.reduce((chain, url) => {
        return chain.then(
            () =>
                new Promise<void>((resolve) => {
                    const s = document.createElement('script');
                    s.src = url;
                    s.onload = () => resolve();
                    document.head.appendChild(s);
                })
        );
    }, Promise.resolve());
}

onMounted(async () => {
    if (!containerRef.value || !props.response.bodyArrayBuffer) return;

    // Load excel-viewer from CDN at runtime
    await loadCss();
    await loadScripts();

    if (!containerRef.value) return;

    const ExcelViewer = (window as any).ExcelViewer;
    if (!ExcelViewer) return;

    viewerInstance = new ExcelViewer(containerRef.value, props.response.bodyArrayBuffer, {
        theme: 'dark',
        themeBtn: false,
        lang: 'en',
    });
});

onBeforeUnmount(() => {
    viewerInstance = null;
});
</script>

<template>
    <div ref="containerRef" class="w-full h-full overflow-hidden"></div>
</template>
