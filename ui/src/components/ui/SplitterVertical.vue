<script setup lang="ts">
import {onUnmounted, ref} from 'vue';
import {twMerge} from "tailwind-merge";

const props = defineProps<{
    localStorageKey?: string;
    defaultHeight?: number;
    minHeight?: number;
    topClass?: string;
    bottomClass?: string;
}>()

// Changed: defines the height of the top panel
const topPanelHeight = defineModel<number>({
    default: (p) => {
        return p.localStorageKey && typeof p.localStorageKey === 'string'
            ? parseFloat(localStorage.getItem(p.localStorageKey) || p.defaultHeight?.toString() || '50') // Changed
            : (p.defaultHeight || 50); // Changed
    }
});
const isDragging = ref<boolean>(false);
const splitterContainer = ref<HTMLElement | null>(null);

const startResize = (event: MouseEvent) => {
    event.preventDefault();
    isDragging.value = true;
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
    document.body.classList.add('select-none');
};

const onResize = (event: MouseEvent) => {
    if (!isDragging.value || !splitterContainer.value) return;

    const containerRect = splitterContainer.value.getBoundingClientRect();
    // Changed: Calculate height based on clientY and container's top/height
    let newTopHeight = ((event.clientY - containerRect.top) / containerRect.height) * 100;

    const minHeight = props.minHeight ?? 5;
    const maxHeight = 100 - minHeight;
    if (newTopHeight < minHeight) newTopHeight = minHeight;
    if (newTopHeight > maxHeight) newTopHeight = maxHeight;

    topPanelHeight.value = newTopHeight;
    if (props.localStorageKey) {
        localStorage.setItem(props.localStorageKey, newTopHeight.toString());
    }
};

const stopResize = () => {
    if (isDragging.value) {
        isDragging.value = false;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
        document.body.classList.remove('select-none');
    }
};

onUnmounted(() => {
    stopResize();
});
</script>

<template>
    <div
        class="flex flex-col w-full h-full overflow-hidden" ref="splitterContainer"
    >
        <div
            :class="twMerge('w-full overflow-auto flex flex-col relative gap-1', topClass)" :style="{ height: topPanelHeight + '%' }"
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
            :class="twMerge('w-full overflow-auto flex flex-col relative gap-1', bottomClass)" :style="{ height: (100 - topPanelHeight) + '%' }"
        >
            <slot name="bottom">
                <div class="p-4">
                    <p>Bottom Panel</p>
                </div>
            </slot>
        </div>
    </div>
</template>