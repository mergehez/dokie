<script setup lang="ts">

import BoxCornerCross from "@/components/BoxCornerCross.vue";

defineProps<{
    index: number;
    title: string;
    description?: string;
}>()
</script>

<template>
    <div class="font-sans" :class="{'sm:border-l relative': index % 2 === 1}">
        <div class="text-xl font-semibold">{{ title }}</div>
        <div class="text-t2 mt-3">
            <slot>{{ description }}</slot>
        </div>
        <BoxCornerCross v-if="index >2 && index % 2 === 1"/>
    </div>
</template>