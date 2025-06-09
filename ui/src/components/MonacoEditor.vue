<script setup lang="ts">

import {type MonacoEditor, VueMonacoEditor} from "@guolao/vue-monaco-editor";
import * as monacoEditor from "monaco-editor";
import {ref} from "vue";
import {ElDialog} from "element-plus";
import {postscriptMonaco} from "@/utils/usePostscript.ts";

const modelValue = defineModel<string>()
const props = defineProps<{
    readonly?: boolean,
    class?: string
    language?: string
}>()

const urlToOpen = ref<string[]>()

function beforeMount(monaco: MonacoEditor) {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
    });

    const libUri = "ts:filename/postscript.d.ts";
    const postscriptDeclaration = postscriptMonaco();
    monaco.languages.typescript.javascriptDefaults.addExtraLib(postscriptDeclaration, libUri);

    const uri = monaco.Uri.parse(libUri);
    if (!monaco.editor.getModel(uri))
        monaco.editor.createModel(postscriptDeclaration, "typescript", uri);

}

function onMount(editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: MonacoEditor) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
        schemaValidation: 'error'
    });
    monaco.editor.registerLinkOpener({
        open: (resource) => {
            let path = resource.path;
            if (resource.scheme == 'file') {
                let line = '';
                if (path.includes(':line')) {
                    line = (path.split(':line:')[1] || path.split(':line')[1]).trim();
                    path = path.split(':line')[0]
                }

                const toTry = [
                    () => {
                        if (line)
                            line = (Number(line) - 1).toString()
                        return `jetbrains://rider/navigate/reference?path=${path}:${line}:1&project=EeyzToolAllProjects`;
                    },
                    () => `vscode://file/${path}`,
                    () => `phpstorm://open?file=${path}`,
                ]
                urlToOpen.value = [path, toTry[0](), toTry[1](), toTry[2]()];
            }

            return true;
        }
    })
}
</script>

<template>
    <div class="h-full">
        <VueMonacoEditor
            v-model:value="modelValue"
            :readonly="readonly"
            theme="vs-dark"
            :language="language ?? 'json'"
            :options="{
          automaticLayout: true,
          formatOnType: true,
          formatOnPaste: true,
          codeLens: false,
          minimap: {
            enabled: false
          },
          glyphMargin: false,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbersMinChars:3,
          showFoldingControls: 'always',
          fixedOverflowWidgets: true
        }"
            @beforeMount="beforeMount"
            @mount="onMount"
            class="w-full min-h-40"
            :class="props.class"
        />
        <ElDialog align-center modal title="Open File" style="width: 25rem" :model-value="urlToOpen?.length == 4" @close="urlToOpen = undefined">
            <template v-if="urlToOpen?.length == 4">
                <div class="text-sm w-full font-bold opacity-80">File:</div>
                <div class="text-sm w-full break-words">{{ urlToOpen[0] }}</div>

                <div class="flex gap-2 mt-4">
                    <a :href="urlToOpen[1]" class="p-button p-button-sm">In Rider</a>
                    <a :href="urlToOpen[2]" class="p-button p-button-sm">In VS Code</a>
                    <a :href="urlToOpen[3]" class="p-button p-button-sm">In PhpStorm</a>
                </div>
            </template>
        </ElDialog>
    </div>
</template>