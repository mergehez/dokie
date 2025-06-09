<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
    icon: `icon-${string}` | undefined,
    loading?: boolean,
    as?: string,
    class?: string,
}>()

const finalClass = computed(() => {
    return [
        {
            'icon-mingcute--loading-fill animate-spin': props.loading,
            'icon': props.icon || props.loading,
        },
        props.icon,
        props.class
    ]
})

</script>

<template>
    <component
        :is="props.as || 'i'"
        :class="finalClass"
    />
</template>