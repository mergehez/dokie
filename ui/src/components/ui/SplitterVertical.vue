<script setup lang="ts">
import {computed, onUnmounted, ref} from 'vue';
import {twMerge} from "tailwind-merge";
import {useSplitterData} from "@/utils/useSplitterData.ts";

const props = withDefaults(defineProps<{
    localStorageKey?: string;
    defaultHeight: string;
    basePanel: 'top' | 'bottom'; // which panel is the base panel for resizing, the other panel will have 'calc(100% - height)'
    class?: string;
    topClass?: string;
    bottomClass?: string;
    draggerInvisible?: boolean;
    topHidden?: boolean;
    bottomHidden?: boolean;
    minHeight?: string; // Minimum height for the resizable panel, e.g., '300px', '80vh'
    maxHeight?: string; // Maximum height for the resizable panel, e.g., '300px', '80vh'
}>(), {
    minHeight: '10%',
    maxHeight: '90%',
})

const splitterData = useSplitterData(props.localStorageKey || '', props.defaultHeight || '50%');
const isDragging = ref<boolean>(false);
const splitterContainer = ref<HTMLElement | null>(null);

const heights = computed(() => {
    if (!splitterContainer.value) {
        return {top: '0', bottom: '0'};
    }
    if (props.bottomHidden) {
        return {top: '100%', bottom: '0'};
    }
    if (props.topHidden) {
        return {top: '0', bottom: '100%'};
    }
    const clampedHeight = `clamp(${props.minHeight}, ${splitterData.width}, ${props.maxHeight})`;

    return {
        top: props.basePanel === 'top' ? clampedHeight : `calc(100% - ${clampedHeight})`,
        bottom: props.basePanel === 'bottom' ? clampedHeight : `calc(100% - ${clampedHeight})`
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
    let newHeight;

    if (props.basePanel === 'top') {
        newHeight = event.clientY - containerRect.top;
    } else {
        newHeight = containerRect.bottom - event.clientY;
    }

    splitterData.width = newHeight + 'px';
    if (props.localStorageKey) {
        localStorage.setItem(props.localStorageKey, newHeight.toString());
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
        class="flex flex-col w-full h-full overflow-hidden" ref="splitterContainer"
    >
        <div
            :class="twMerge('w-full overflow-auto flex flex-col relative gap-1', topClass)" :style="{ height: heights.top }"
        >
            <slot name="top">
                <div class="p-4">
                    <p>Top Panel</p>
                </div>
            </slot>
        </div>
        <div
            class="h-1 w-full bg-x2 hover:bg-x6 cursor-row-resize flex-shrink-0" @mousedown="startResize"
            title="Drag to resize"
        ></div>
        <div
            :class="twMerge('w-full overflow-auto flex flex-col relative gap-1', bottomClass)" :style="{ height: heights.bottom }"
        >
            <slot name="bottom">
                <div class="p-4">
                    <p>Bottom Panel</p>
                </div>
            </slot>
        </div>
    </div>
</template>