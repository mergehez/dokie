import {reactive} from "vue";

export function uniqueId(len = 10) {
    const arr = new Uint8Array(len / 2);
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec => dec.toString(16).padStart(2, "0")).join('')
}


const _storeDict = new Map<string, any>();

export function defineStore<T extends Record<string, any>>(key: string, fn: () => T): (() => T) {
    return () => {
        if (_storeDict.has(key)) {
            return _storeDict.get(key);
        }

        const value = reactive(fn());
        _storeDict.set(key, value);
        return value as T;
    };
}

export function distinct<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

export function distinctBy<T, Y>(arr: T[], by: (t: T) => Y): T[] {
    const seen = new Set<Y>();
    return arr.filter(item => {
        const key = by(item);
        if (seen.has(key)) {
            return false;
        } else {
            seen.add(key);
            return true;
        }
    });
}