import {computed, reactive, ref} from "vue";
import {defineStore} from "@/utils/utils.ts";

function createSplitterData(localStorageKey: string, defaultValue: string) {
    let v = localStorage.getItem(localStorageKey) || defaultValue || '50%'
    if (!Number.isNaN(parseInt(v)) && !v.includes('%')) {
        v = defaultValue || '50%';
        localStorage.setItem(localStorageKey, v);
    }
    const storageValue = ref(v);
    const width = computed({
        get: () => storageValue.value,
        set: (val: string) => {
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