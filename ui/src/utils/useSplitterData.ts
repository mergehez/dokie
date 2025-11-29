import {computed, reactive, ref} from "vue";
import {defineStore} from "@/utils/utils.ts";

function createSplitterData(localStorageKey: string, defaultValue: string) {
    const storageValue = ref(parseFloat(localStorage.getItem(localStorageKey) || defaultValue || '50'));
    const width = computed({
        get: () => storageValue.value,
        set: (val: number) => {
            storageValue.value = val;
            localStorage.setItem(localStorageKey, val.toString());
        }
    })

    return reactive({
        width
    })
}


export function useSplitterData(localStorageKey: string, defaultValue: string) {
    return defineStore(localStorageKey, () => createSplitterData(localStorageKey, defaultValue))();
}