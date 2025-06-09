<script setup lang="ts">
import {ElMention, type MentionOption} from "element-plus";
import {uniqueId} from "@/utils/utils.ts";
import {onMounted, ref, watch} from "vue";
import {useGlobalEnvs} from "@/utils/useGlobalEnvs";

const _modelValue = defineModel<string | undefined>({required: true})
const modelValue = ref(_modelValue.value);
const envs = useGlobalEnvs()
watch(modelValue, (nv) => {
    _modelValue.value = nv;
});

const props = defineProps<{
    textarea?: boolean,
    autosize?: { minRows?: number, maxRows?: number }
}>()

const mentionRef = ref<HTMLTextAreaElement>();

const options = ref<MentionOption[]>([]);

function filterStrings(q: string, all: string[]) {
    q = q.trim().toLowerCase();
    if (q) {
        all = q.includes('.')
            ? all.filter((item) => item.toLowerCase().startsWith(q))
            : all.filter((item) => item.toLowerCase().includes(q));
    }
    return all;
}

function suggest(q: string) {
    let useSuffix = true;
    if (q === '$$$') {
        q = '';
    } else {
        const m = mentionRef.value;
        const mv = m?.value ?? '';
        const selStart = m?.selectionStart ?? mv.length;
        if (selStart && selStart > 0) {
            const charBefore = mv.slice(selStart - 2, selStart - 1);
            if (charBefore !== '{') {
                return options.value = [];
            }

            const after = mv.substring(selStart);
            if (after.includes('}}')) {
                useSuffix = false;
            }
        }
    }

    // return options.value = getSuggestionsUsingIterationData(q, layout.selection.iterationData, state.document.testJson, '}}');
    return options.value = filterStrings(q, envs.variables.merge(envs.headers).map(t => t.key)).filter(t => !['hostnames', 'hostname'].includes(t)).map(t => {
        return {
            value: t + (useSuffix ? '}}' : ''),
            label: t,
            disabled: false,
        } satisfies MentionOption;
    })
}

suggest('$$$');

const id = uniqueId();
onMounted(() => {
    setTimeout(() => {
        mentionRef.value = document.getElementById(id) as HTMLTextAreaElement;
        suggest('$$$');
    }, 200)
})

let autocompleted = false;
let changedAfterAutocomplete = false;

function onSelected() {
    autocompleted = true;
    changedAfterAutocomplete = false;
}

function onBlur() {
    if (autocompleted && !changedAfterAutocomplete) {
        modelValue.value = modelValue.value?.trim() || '';
    }
    autocompleted = false;
}

function onInput() {
    if (autocompleted) {
        changedAfterAutocomplete = true;
    }
}

</script>

<template>
    <ElMention
        v-model="modelValue"
        :id="id"
        :type="textarea ? 'textarea' : undefined"
        :autosize="autosize"
        :options="options"
        @search="suggest"
        @select="onSelected"
        @blur="onBlur"
        @input="onInput"
        :prefix="['{']"
    />
</template>