<script setup lang="ts">
import { computed } from 'vue';


const props = defineProps<{
    method: string,
    fullName?: boolean
}>()

const m = computed(() => {
    return props.method.toUpperCase()
})
</script>

<template>
    <span
    class="font-bold"
        :class="{
            'text-green-400': m === 'GET',
            'text-yellow-400': m === 'POST',
            'text-blue-400': m === 'PUT',
            'text-red-400': m === 'DELETE',
            'text-purple-400': m === 'PATCH',
        }"
    >
        {{ fullName ? m : m.substring(0, 3) }}
    </span>
</template>