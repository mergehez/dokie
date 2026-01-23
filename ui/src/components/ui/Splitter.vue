<script setup lang="ts">
import {computed, onUnmounted, ref} from 'vue';
import {twMerge} from "tailwind-merge";
import {useSplitterData} from "@/utils/useSplitterData.ts";

const props = withDefaults(defineProps<{
    localStorageKey?: string;
    defaultWidth: string;
    baseSide: 'left' | 'right'; // which side is the base side for resizing, the other side will be have 'calc(100% - width)'
    class?: string;
    leftClass?: string;
    rightClass?: string;
    draggerInvisible?: boolean;
    leftHidden?: boolean;
    rightHidden?: boolean;
    minWidth?: string; // Minimum width for the resizable panel, e.g., '300px', '80vw'
    maxWidth?: string; // Maximum width for the resizable panel, e.g., '300px', '80vw'
}>(), {
    minWidth: '10%',
    maxWidth: '90%',
})

const splitterData = useSplitterData(props.localStorageKey || '', props.defaultWidth || '50%');
const isDragging = ref<boolean>(false);
const splitterContainer = ref<HTMLElement | null>(null);

const widths = computed(() => {
    if (!splitterContainer.value) {
        return {left: '0', right: '0'};
    }
    if (props.rightHidden) {
        return {left: '100%', right: '0'};
    }
    if (props.leftHidden) {
        return {left: '0', right: '100%'};
    }
    const clampedWidth = `clamp(${props.minWidth}, ${splitterData.width}, ${props.maxWidth})`;

    return {
        left: props.baseSide === 'left' ? clampedWidth : `calc(100% - ${clampedWidth})`,
        right: props.baseSide === 'right' ? clampedWidth : `calc(100% - ${clampedWidth})`
    };
});

const startResize = (event: MouseEvent) => {
    event.preventDefault();
    isDragging.value = true;
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
    // Optional: Add user-select-none to body to prevent text selection during drag
    document.body.classList.add('select-none');
};

const onResize = (event: MouseEvent) => {
    if (!isDragging.value || !splitterContainer.value) return;

    const containerRect = splitterContainer.value.getBoundingClientRect();
    let newWidth;

    if (props.baseSide === 'left') {
        newWidth = event.clientX - containerRect.left;
    } else {
        newWidth = containerRect.right - event.clientX;
    }

    splitterData.width = newWidth + 'px';
    if (props.localStorageKey) {
        localStorage.setItem(props.localStorageKey, newWidth.toString());
    }
};

const stopResize = () => {
    if (isDragging.value) {
        isDragging.value = false;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
        // Optional: Remove user-select-none from body
        document.body.classList.remove('select-none');
    }
};

onUnmounted(() => {
    // Clean up event listeners when the component is unmounted
    stopResize(); // Call stopResize to ensure listeners are removed
});
</script>

<template>
    <div
        :class="twMerge('flex w-full h-full overflow-hidden border border-x4', props.class)"
        ref="splitterContainer"
    >
        <div
            v-if="!leftHidden"
            :class="twMerge('h-full overflow-auto flex flex-col relative gap-1', props.leftClass)"
            :style="{ width: widths.left }"
        >
            <slot name="left">
                <div class="p-4">
                    <p>Left Panel</p>
                </div>
            </slot>
        </div>
        <div
            v-if="!leftHidden && !rightHidden"
            class="w-1 h-full bg-x2 hover:bg-x6 cursor-col-resize flex-shrink-0"
            :class="{ 'opacity-0 hover:opacity-100' : draggerInvisible }"
            @mousedown="startResize"
            title="Drag to resize"
        ></div>
        <div
            v-if="!rightHidden"
            :class="twMerge('h-full overflow-auto flex flex-col relative gap-1', props.rightClass)"
            :style="{ width: widths.right }"
        >
            <slot name="right">
                <div class="p-4">
                    <p>Right Panel</p>
                </div>
            </slot>
        </div>
    </div>
</template>