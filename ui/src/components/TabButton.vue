<script setup lang="ts" generic="T">
const modelValue = defineModel<T>({required: true})
const props = defineProps<{
    tab: T,
    text: string,
}>()
</script>

<template>
    <button
        @click.prevent="modelValue = tab"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="{
            'border-b-2 border-blue-600 text-blue-600': modelValue === tab,
            'text-gray-600 dark:text-gray-400': modelValue !== tab
        }"
    >
        {{ text }}
    </button>
</template>