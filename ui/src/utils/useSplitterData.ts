import { computed, reactive, ref } from 'vue';
import { defineStore } from '@/utils/utils.ts';

function createSplitterData(localStorageKey: string, defaultValue: string) {
    let v = (localStorageKey ? localStorage.getItem(localStorageKey) : null) || defaultValue || '50%';
    // Older splitter code may have stored a bare pixel count. Normalize it to
    // a CSS length instead of discarding the user's saved size.
    if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(v)) {
        v = `${v}px`;
        if (localStorageKey) {
            localStorage.setItem(localStorageKey, v);
        }
    }
    const storageValue = ref(v);
    const width = computed({
        get: () => storageValue.value,
        set: (val: string) => {
            storageValue.value = val;
            if (localStorageKey) {
                localStorage.setItem(localStorageKey, val.toString());
            }
        },
    });

    return reactive({
        width,
    });
}

export function useSplitterData(localStorageKey: string, defaultValue: string) {
    return defineStore(localStorageKey, () => createSplitterData(localStorageKey, defaultValue))();
}
