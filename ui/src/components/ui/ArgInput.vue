<script setup lang="ts">

import {ElInput, type InputEmits, type InputProps} from "element-plus";

type aa = InputEmits & InputProps;
const modelValue = defineModel<string | undefined>({required: true})
const props = defineProps<{
    placeholder?: string;
    inputStyle?: string;
}>()

// const emit = defineEmits<InputEmits>();
// const reg
</script>

<template>
    <ElInput
        v-model="modelValue"
        :input-style="inputStyle"
        class="bg-x1/50"
        :placeholder="placeholder"
    />
</template>