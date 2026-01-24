<script setup lang="ts">

import {ElInput} from "element-plus";
import {ref} from "vue";

const modelValue = defineModel<string | undefined>({required: true})
const props = defineProps<{
    placeholder?: string;
    inputStyle?: string;
    autosize?: boolean;
}>()

// const autosize = ref<any>(props.autosize ? {minRows: 1, maxRows: 1} : false);
// const uniqueKey = ref('aaa');
// const refInput = useTemplateRef('refInput');
// let keyWhenFocused = uniqueKey.value
// let caretWhenFocused = 0;
//
// function onFocus() {
//     if (!props.autosize || keyWhenFocused != uniqueKey.value) return;
//
//     const inp = refInput.value?.input || refInput.value?.textarea!;
//     if (inp.scrollWidth <= inp.clientWidth) return;
//
//     setTimeout(() => {
//         caretWhenFocused = refInput.value?.input?.selectionStart || refInput.value?.textarea?.selectionStart || 0;
//
//         keyWhenFocused = uniqueKey.value;
//         autosize.value = {minRows: 1, maxRows: 5};
//         uniqueKey.value = uniqueId();
//         setTimeout(() => {
//             refInput.value?.textarea?.focus();
//             keyWhenFocused = uniqueKey.value
//             if (refInput.value?.textarea) {
//                 refInput.value.textarea.selectionStart = caretWhenFocused;
//                 refInput.value.textarea.selectionEnd = caretWhenFocused;
//             }
//         }, 50);
//     }, 100)
// }
//
// function onBlur() {
//     if (!props.autosize || keyWhenFocused != uniqueKey.value) return;
//     // isFocused.value = false;
//     autosize.value = {minRows: 1, maxRows: 1};
//     uniqueKey.value = uniqueId();
//     keyWhenFocused = uniqueKey.value
// }
const isFocused = ref(false);
</script>

<template>
    <ElInput
        :model-value="modelValue"
        @update:model-value="v => modelValue = v"
        :input-style="inputStyle"
        class="bg-x1/50"
        :class="{
            '*:max-h-75': isFocused,
            '*:max-h-25': !isFocused
        }"
        :placeholder="placeholder"
        :autosize="autosize"
        :type="autosize ? 'textarea' : 'text'"
        resize="none"
        @focus="isFocused = true"
        @click="isFocused = true"
        @blur="isFocused = false"
    />
</template>