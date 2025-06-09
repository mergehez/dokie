<script setup lang="ts">
import type {KeyVal} from '@/utils/useDb.ts';
import ArgInput from "@/components/ui/ArgInput.vue";
import AutocompleteText from "@/components/ui/AutocompleteText.vue";
import type {KeyValCollection} from "@/utils/useKeyValCollection.ts";

defineProps<{
    kvCollection: KeyValCollection,
    onChange: (kv: KeyVal) => any,
    skip?: (kv: KeyVal) => boolean,
    autocomplete?: boolean,
}>()
</script>

<template>
    <div class="space-y-1 grid items-center" style="grid-template-columns: auto auto 1fr auto">
        <template v-for="(p) in kvCollection.keyVals" :key="p.key">
            <template v-if="!skip || !skip(p)">
                <span v-if="p.required" class="icon icon-[gg--asterisk] -ml-4"> </span>
                <i v-else></i>
                <ArgInput
                    v-model="p.key"
                    @update:model-value="() => onChange(p)"
                    placeholder="Key"
                />
                <AutocompleteText
                    v-if="autocomplete"
                    :model-value="p.value?.toString()"
                    @update:modelValue="v => p.value = v || ''"
                />
                <ArgInput
                    v-else
                    :model-value="p.value?.toString()"
                    @update:modelValue="v => p.value = v"
                    @update:model-value="() => onChange(p)"
                    placeholder="Value"
                />
                <span
                    @click="() => kvCollection.remove(p)"
                    class="p-1 text-surface-600 hover:text-surface-200 cursor-pointer transition-colors"
                    v-if="!p.locked"
                >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clip-rule="evenodd"/>
                        </svg>
                    </span>
                <i v-else></i>
                <div v-if="p.desc" class="text-xs opacity-70 pl-1 -mt-1 col-span-4">{{ p.desc }}</div>
            </template>
        </template>
    </div>
</template>