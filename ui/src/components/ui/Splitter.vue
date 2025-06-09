<script setup lang="ts">
import {onUnmounted, ref} from 'vue';
import {twMerge} from "tailwind-merge";

const props = defineProps<{
    localStorageKey?: string;
    defaultWidth?: number;
    leftClass?: string;
    rightClass?: string;
}>()

const leftPanelWidth = defineModel<number>({
    default: (p) => {
        return p.localStorageKey && typeof p.localStorageKey === 'string'
            ? parseFloat(localStorage.getItem(p.localStorageKey) || p.defaultWidth?.toString() || '50')
            : (p.defaultWidth || 50);
    }
});
const isDragging = ref<boolean>(false);
const splitterContainer = ref<HTMLElement | null>(null);

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
    let newLeftWidth = ((event.clientX - containerRect.left) / containerRect.width) * 100;

    // Clamp width between a min and max percentage (e.g., 10% and 90%)
    const minWidth = 10;
    const maxWidth = 90;
    if (newLeftWidth < minWidth) newLeftWidth = minWidth;
    if (newLeftWidth > maxWidth) newLeftWidth = maxWidth;

    leftPanelWidth.value = newLeftWidth;
    if (props.localStorageKey) {
        localStorage.setItem(props.localStorageKey, newLeftWidth.toString());
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
        class="flex w-full h-full overflow-hidden border border-x4"
        ref="splitterContainer"
    >
        <div
            :class="twMerge('h-full overflow-auto flex flex-col relative gap-1', props.leftClass)"
            :style="{ width: leftPanelWidth + '%' }"
        >
            <slot name="left">
                <div class="p-4">
                    <p>Left Panel</p>
                </div>
            </slot>
        </div>
        <div
            class="w-1 h-full bg-x2 hover:bg-x6 cursor-col-resize flex-shrink-0"
            @mousedown="startResize"
            title="Drag to resize"
        ></div>
        <div
            :class="twMerge('h-full overflow-auto flex flex-col relative gap-1', props.rightClass)"
            :style="{ width: (100 - leftPanelWidth) + '%' }"
        >
            <slot name="right">
                <div class="p-4">
                    <p>Right Panel</p>
                </div>
            </slot>
        </div>
    </div>
</template>