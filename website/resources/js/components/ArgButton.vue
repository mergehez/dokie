<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { computed } from 'vue';

export type TButtonSeverity = 'primary' | 'raised' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
export type ButtonProps = {
    severity?: TButtonSeverity;
    as?: any;
    loading?: boolean;
    small?: boolean;
    smallY?: boolean;
    iconOnly?: boolean;
};
const props = defineProps<ButtonProps>();

const severityClass = computed(() => {
    if (!props.severity) return '';
    return {
        primary: 'btn-primary',
        raised: 'btn-raised',
        secondary: 'btn-secondary',
        success: 'btn-success',
        info: 'btn-info',
        warning: 'btn-warning',
        danger: 'btn-danger',
    }[props.severity];
});
</script>

<template>
    <component
        :is="props.as || 'button'"
        class="btn"
        :class="twMerge(severityClass, iconOnly || small ? 'btn-sm rounded' : '', smallY ? 'small-y' : '', iconOnly ? 'px-1' : '', $attrs.class as any)"
        :disabled="props.loading"
    >
        <i v-if="props.loading" class="icon icon-[mingcute--loading-fill] animate-spin" />
        <slot> </slot>
    </component>
</template>
