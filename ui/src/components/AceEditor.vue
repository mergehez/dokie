<script setup lang="ts">
import { ElDialog } from 'element-plus';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

declare const ace: any;
declare const LanguageProvider: any;

const lp = (window as any).LanguageProvider.fromCdn('https://www.unpkg.com/ace-linters@2.2.0/build/');

const modelValue = defineModel<string>();
const props = defineProps<{
    readonly?: boolean;
    class?: string;
    language?: string;
    typings?: string;
}>();

const containerRef = ref<HTMLDivElement>();
const urlToOpen = ref<string[]>();
let editor: any = null;
let resizeObserver: ResizeObserver | null = null;

function getAceMode(lang?: string): string {
    if (!lang) return 'ace/mode/json';
    const map: Record<string, string> = {
        json: 'ace/mode/json',
        typescript: 'ace/mode/typescript',
        ts: 'ace/mode/typescript',
        javascript: 'ace/mode/typescript',
        js: 'ace/mode/typescript',
        xml: 'ace/mode/xml',
        html: 'ace/mode/html',
        text: 'ace/mode/text',
        'form-data': 'ace/mode/text',
    };
    return map[lang] || `ace/mode/${lang}`;
}

onMounted(() => {
    if (!containerRef.value) return;

    editor = ace.edit(containerRef.value, {
        value: modelValue.value ?? '',
        mode: getAceMode(props.language),
        theme: 'ace/theme/monokai',
        readOnly: props.readonly ?? false,
        showPrintMargin: false,
        showGutter: true,
        highlightActiveLine: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: false,
        // fontSize: 13,
        // tabSize: 2,
        useSoftTabs: true,
        wrap: true,
    });

    editor.on('change', () => {
        modelValue.value = editor?.getValue() ?? '';
    });
    lp.registerEditor(editor);

    if (props.typings) {
        lp.setGlobalOptions('typescript', {
            extraLibs: {
                'ts:filename/postscript.d.ts': { content: props.typings, version: 1 },
            },
        });
    }

    resizeObserver = new ResizeObserver(() => {
        editor?.resize();
    });
    resizeObserver.observe(containerRef.value);

    watch(
        () => props.language,
        (lang) => {
            editor?.session.setMode(getAceMode(lang));
        }
    );
    watch(
        () => props.readonly,
        (val) => {
            editor?.setReadOnly(val ?? false);
        }
    );
    watch(
        () => modelValue.value,
        (val) => {
            if (editor && val !== editor.getValue()) {
                const pos = editor.getCursorPosition();
                editor.setValue(val ?? '', 1);
                editor.moveCursorToPosition(pos);
            }
        }
    );
    // Re-render when visibility changes
    watch(
        () => props.class,
        () => setTimeout(() => editor?.resize(), 0)
    );
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    if (editor) {
        lp.unregisterEditor(editor);
        editor.destroy();
    }
    editor = null;
});
</script>

<template>
    <div class="h-full flex flex-col">
        <div ref="containerRef" class="w-full flex-1 min-h-40" :class="props.class" />
        <ElDialog align-center modal title="Open File" style="width: 25rem" :model-value="urlToOpen?.length == 4" @close="urlToOpen = undefined">
            <template v-if="urlToOpen?.length == 4">
                <div class="text-sm w-full font-bold opacity-80">File:</div>
                <div class="text-sm w-full wrap-break-word">{{ urlToOpen[0] }}</div>

                <div class="flex gap-2 mt-4">
                    <a :href="urlToOpen[1]" class="p-button p-button-sm">In Rider</a>
                    <a :href="urlToOpen[2]" class="p-button p-button-sm">In VS Code</a>
                    <a :href="urlToOpen[3]" class="p-button p-button-sm">In PhpStorm</a>
                </div>
            </template>
        </ElDialog>
    </div>
</template>
