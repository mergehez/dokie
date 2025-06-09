<!--<script setup lang="ts">-->

<!--import {computed, onMounted, onUnmounted, ref, type UnwrapRef, watch} from "vue";-->
<!--import type {EndpointKeyVals} from "@/utils/useEndpoint.ts";-->

<!--type T = EndpointKeyVals;-->
<!--const props = defineProps<{-->
<!--    items: T[],-->
<!--    onChange?: (items: T[]) => void-->
<!--}>()-->

<!--const requiredClass = 'drag-item';-->
<!--const dragOverClass = 'drag-tabs-over';-->
<!--const draggedClass = 'drag-tabs-dragged';-->

<!--function addClass(el: any, className: string){-->
<!--    el.classList.add(className);-->
<!--}-->
<!--function removeClass(el: any, className: string){-->
<!--    el.classList.remove(className);-->
<!--}-->

<!--const draggingHash = ref<string>();-->
<!--function useTab(item: T){-->
<!--    function onDragStart(e: DragEvent){-->
<!--        console.log('drag start', e.target, item);-->
<!--        draggingHash.value = item.hash;-->
<!--        e.dataTransfer?.setDragImage(e.target as any, 0, 0);-->
<!--        addClass(e.target, draggedClass);-->
<!--    }-->
<!--    function onDragOver(e: DragEvent){-->
<!--        e.preventDefault();-->
<!--        addClass(e.target, dragOverClass);-->
<!--    }-->
<!--    function onDragLeave(e: DragEvent){-->
<!--        e.preventDefault();-->
<!--        removeClass(e.target, dragOverClass);-->
<!--    }-->
<!--    function onDragEnd(e: DragEvent){-->
<!--        console.log('drag end');-->
<!--        e.preventDefault();-->
<!--        draggingHash.value = undefined;-->
<!--        removeClass(e.target, draggedClass);-->
<!--    }-->
<!--    function onDrop(e: DragEvent){-->
<!--        console.log('drop');-->
<!--        removeClass(e.target, dragOverClass);-->
<!--        // const sourceIndex = Number(e.dataTransfer?.getData('text/plain'));-->
<!--        if(!draggingHash.value) {-->
<!--            return console.log('draggingHash not found');-->
<!--        }-->
<!--        const targetHash = (e.target as any).id;-->
<!--        if(draggingHash.value == item.hash) {-->
<!--            return console.log('draggingHash is the same as item hash');-->
<!--        }-->
<!--        const sourceIndex = props.items.findIndex(t => t.hash == draggingHash.value);-->
<!--        if(sourceIndex < 0) {-->
<!--            return console.log('sourceIndex not found');-->
<!--        }-->
<!--        const sourceItem = props.items[sourceIndex]!;-->
<!--        const targetItem = props.items.find(t => t.hash == targetHash);-->

<!--        sourceItem.index = targetItem.index-->
<!--        const srcWasAfterTarget = sourceIndex > targetItem.index;-->
<!--        for (const curr of items2.value) {-->
<!--            if(curr.data.id == sourceItem.data.id)-->
<!--                continue;-->

<!--            if(srcWasAfterTarget && curr.index >= targetItem.index){-->
<!--                curr.index++;-->
<!--            }else if(!srcWasAfterTarget && curr.index <= targetItem.index){-->
<!--                curr.index&#45;&#45;;-->
<!--            }-->
<!--        }-->
<!--        if(props.onChange)-->
<!--            props.onChange(sortedItems.value.map(t => t.data));-->
<!--    }-->
<!--    return {-->
<!--        onDragStart,-->
<!--        onDragEnd,-->
<!--        onDrop,-->
<!--        onDragOver,-->
<!--        onDragLeave,-->
<!--    };-->
<!--}-->

<!--const tabs = ref<ReturnType<typeof useTab>[]>([]);-->
<!--function init(){-->
<!--    const wrapper = document.querySelector('#tagsWrapper');-->
<!--    if(!wrapper) return;-->
<!--    console.log('DragTabs init', items2.value);-->
<!--    const tabEls = wrapper.querySelectorAll(`.${requiredClass}`);-->
<!--    tabEls.forEach((tabEl) => {-->
<!--        const hash = tabEl.id;-->
<!--        const item = items2.value.find(t => t.data.hash == hash);-->
<!--        if(item)-->
<!--            item!.dom = tabEl as HTMLElement;-->
<!--    });-->

<!--    items2.value.forEach((item) => {-->
<!--        const tab = useTab(item);-->
<!--        tabs.value.push(tab);-->
<!--    });-->

<!--}-->

<!--onMounted(() => {-->
<!--    init();-->
<!--})-->

<!--function removeListeners(){-->
<!--    tabs.value.forEach(tab => tab.removeListeners());-->
<!--}-->

<!--onUnmounted(() => {-->
<!--    tabs.value.forEach(tab => tab.removeListeners());-->
<!--})-->

<!--defineExpose({-->
<!--    init,-->
<!--    removeListeners-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--    <TransitionGroup name="drag-tabs" tag="div" id="tagsWrapper">-->
<!--        <template v-for="(e, i) in items" :key="e.id">-->
<!--            <slot name="tab" :requiredClass="requiredClass" :item="e" :events="useTab(e)"/>-->
<!--        </template>-->
<!--    </TransitionGroup>-->
<!--</template>-->


<!--<style>-->
<!--.drag-tabs-move,-->
<!--.drag-tabs-enter-active,-->
<!--.drag-tabs-leave-active {-->
<!--    transition: all 0.5s ease;-->
<!--}-->

<!--.drag-tabs-enter-from,-->
<!--.drag-tabs-leave-to {-->
<!--    opacity: 0;-->
<!--    transform: translateX(30px);-->
<!--}-->
<!--.drag-tabs-leave-active {-->
<!--    position: absolute;-->
<!--}-->

<!--.drag-tabs-dragged{-->
<!--    opacity: 0.5;-->
<!--}-->

<!--.drag-tabs-over:not(.drag-tabs-dragged){-->
<!--    box-shadow: inset 4px 0 0 0 #fa56ff;-->
<!--}-->
<!--</style>-->