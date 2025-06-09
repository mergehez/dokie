import {uniqueId} from "@/utils/utils.ts";
import type {KeyVal} from "@/utils/useDb.ts";


export type KeyValCollection = ReturnType<typeof useKeyValCollection>;

export function useKeyValCollection(keyVals: KeyVal[]) {
    function remove(p: KeyVal) {
        const i = keyVals.findIndex(kv => kv.id === p.id);
        if (i !== -1) {
            keyVals.splice(i, 1);
        } else {
            console.warn("KeyValCollection: remove called with non-existing key", p);
        }
    }

    function addNew(key: string = "", value: string = "") {
        const newVal = {
            id: uniqueId(),
            key: key ?? "",
            value: value ?? "",
        };
        keyVals.push(newVal);
    }

    const findIndexByKey = (key: string) => {
        return keyVals.findIndex((kv) => kv.key === key);
    };

    const get = (key: string) => {
        const index = findIndexByKey(key);
        if (index !== -1) {
            return keyVals[index];
        }
        return undefined;
    };
    const getValue = (key: string) => {
        const index = findIndexByKey(key);
        if (index !== -1) {
            return keyVals[index].value;
        }
        return "";
    };
    const getAny = (key: string) => {
        const a = keyVals.find((kv) => kv.key === key);
        if (a)
            return a.value;
        return undefined;
    };

    const upsert = (key: string, value: string) => {
        const index = findIndexByKey(key);
        if (index !== -1) {
            keyVals[index].value = value;
        } else {
            keyVals.push({id: uniqueId(), key, value});
        }
    };

    const insertIfNotExists = (key: string, value: string, locked?: boolean, required?: boolean) => {
        if (!keyVals.some(t => t.key === key)) {
            keyVals.push({id: uniqueId(), key, value, locked, required});
        }
    };

    const merge = (other: KeyVal[] | { keyVals: KeyVal[] }) => {
        if (!Array.isArray(other)) {
            other = other.keyVals;
        }
        return [...keyVals, ...other];
    }

    return {
        get: get,
        getValue: getValue,
        // getAny: getAny,
        upsert: upsert,
        insertIfNotExists: insertIfNotExists,
        remove: remove,
        addNew: addNew,
        merge: merge,
        keyVals: keyVals,
        findIndexByKey: findIndexByKey,
    }
}