<script setup lang="ts">

import {computed, onMounted, onUnmounted, ref, type UnwrapRef, watch} from "vue";
import type {Endpoint} from "@/utils/useEndpoint.ts";

type T = Endpoint;
const props = defineProps<{
    items: T[],
    onChange?: (items: T[]) => void
}>()

const requiredClass = 'drag-item';
const dragOverClass = 'drag-tabs-over';
const draggedClass = 'drag-tabs-dragged';

type Item = {
    index: number,
    data: T | UnwrapRef<T>,
    dom: HTMLElement | undefined
}
const items2 = ref(props.items.map((t, i) => {
    return {
        index: i,
        data: t,
        dom: undefined as HTMLElement | undefined
    }
}));

watch(() => props.items, (newItems) => {
    items2.value = newItems.map((t, i) => {
        return {
            index: i,
            data: t,
            dom: undefined as HTMLElement | undefined
        }
    });
    setTimeout(() => {
        removeListeners();
        init();
    }, 200);
}, {deep: true});

const sortedItems = computed<Item[]>(() => items2.value.sort((a, b) => a.index - b.index));

function addClass(el: any, className: string) {
    el.classList.add(className);
}

function removeClass(el: any, className: string) {
    el.classList.remove(className);
}

const draggingIndex = ref<number>();

function useTab(item: Item) {
    function onDragStart(e: DragEvent) {
        console.log('drag start', e.target, item.data);
        draggingIndex.value = item.index;
        e.dataTransfer?.setDragImage(e.target as any, 0, 0);
        addClass(e.target, draggedClass);
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();
        addClass(e.target, dragOverClass);
    }

    function onDragLeave(e: DragEvent) {
        e.preventDefault();
        removeClass(e.target, dragOverClass);
    }

    function onDragEnd(e: DragEvent) {
        console.log('drag end');
        e.preventDefault();
        draggingIndex.value = undefined;
        removeClass(e.target, draggedClass);
    }

    function onDrop(e: DragEvent) {
        console.log('drop', item.data.id, item.data.hash, (e.target as any).id);
        removeClass(e.target, dragOverClass);
        // const sourceIndex = Number(e.dataTransfer?.getData('text/plain'));
        const sourceIndex = draggingIndex.value
        if (!sourceIndex) {
            return console.log('sourceIndex not found');
        }
        const targetItem = item;
        if (targetItem.index == sourceIndex) {
            return console.log('targetItem not found');
        }

        const sourceItem = items2.value.find(t => t.index == sourceIndex);
        if (!sourceItem) {
            return console.log('sourceItem not found. sourceIndex: ', sourceIndex);
        }

        sourceItem.index = targetItem.index
        const srcWasAfterTarget = sourceIndex > targetItem.index;
        for (const curr of items2.value) {
            if (curr.data.id == sourceItem.data.id)
                continue;

            if (srcWasAfterTarget && curr.index >= targetItem.index) {
                curr.index++;
            } else if (!srcWasAfterTarget && curr.index <= targetItem.index) {
                curr.index--;
            }
        }
        if (props.onChange)
            props.onChange(sortedItems.value.map(t => t.data));
    }

    const domx = item.dom!;
    domx.addEventListener('dragstart', onDragStart);
    domx.addEventListener('dragend', onDragEnd);
    domx.addEventListener('drop', onDrop);
    domx.addEventListener('dragover', onDragOver);
    domx.addEventListener('dragleave', onDragLeave);
    return {
        removeListeners: () => {
            domx.removeEventListener('dragstart', onDragStart);
            domx.removeEventListener('dragend', onDragEnd);

            domx.removeEventListener('drop', onDrop);
            domx.removeEventListener('dragover', onDragOver);
            domx.removeEventListener('dragleave', onDragLeave);
        }
    }
}

const tabs = ref<ReturnType<typeof useTab>[]>([]);

function init() {
    const wrapper = document.querySelector('#tagsWrapper');
    if (!wrapper) return;
    // console.log('DragTabs init', items2.value);
    const tabEls = wrapper.querySelectorAll(`.${requiredClass}`);
    tabEls.forEach((tabEl) => {
        const hash = tabEl.id;
        const item = items2.value.find(t => t.data.hash == hash);
        if (item)
            item!.dom = tabEl as HTMLElement;
    });

    items2.value.forEach((item) => {
        const tab = useTab(item);
        tabs.value.push(tab);
    });

}

onMounted(() => {
    init();
})

function removeListeners() {
    tabs.value.forEach(tab => tab.removeListeners());
}

onUnmounted(() => {
    tabs.value.forEach(tab => tab.removeListeners());
})

defineExpose({
    init,
    removeListeners
})
</script>

<template>
    <TransitionGroup name="drag-tabs" tag="div" id="tagsWrapper">
        <template v-for="(e, i) in sortedItems" :key="e.data.id">
            <slot name="tab" :requiredClass="requiredClass" :item="e.data" :i="i"/>
        </template>
    </TransitionGroup>
</template>


<style>
.drag-tabs-move,
.drag-tabs-enter-active,
.drag-tabs-leave-active {
    transition: all 0.5s ease;
}

.drag-tabs-enter-from,
.drag-tabs-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.drag-tabs-leave-active {
    position: absolute;
}

.drag-tabs-dragged {
    opacity: 0.5;
}

.drag-tabs-over:not(.drag-tabs-dragged) {
    box-shadow: inset 4px 0 0 0 #fa56ff;
}
</style>