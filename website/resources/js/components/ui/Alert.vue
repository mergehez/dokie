<script setup lang="ts">
import {computed, ref} from "vue";
import {twMerge} from "tailwind-merge";
import Icon from "@/Components/UI/Icon.vue";
import Button from "@/Components/UI/Button.vue";

export type TAlertSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';

const props = defineProps<{
    severity?: TAlertSeverity,
    closable?: boolean,
    small?: boolean
}>()

const severityClass = computed(() => {
    if (!props.severity) return '';
    return {
        primary: 'alert-primary',
        secondary: 'alert-secondary',
        success: 'alert-success',
        info: 'alert-info',
        warning: 'alert-warning',
        danger: 'alert-danger'
    }[props.severity]
})

const show = ref(true);

</script>

<template>
    <Transition
        leave-active-class="transition ease-in duration-500"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
    >
        <div
            v-if="show"
            :class="twMerge(
            'alert relative',
                severityClass, small ? 'alert-sm' : '',
                $attrs.class as any
            )"
        >
            <slot></slot>
            <Button
                v-if="props.closable"
                class="absolute right-0 p-1.5 hover:opacity-70"
                small
                @click.prevent.stop="show = false"
            >
                <Icon icon="icon-mdi--close"/>
            </Button>
        </div>
    </Transition>
</template>
