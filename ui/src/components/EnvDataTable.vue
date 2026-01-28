<script setup lang="ts">
import type {KeyVal} from '@/utils/useDb.ts';
import ArgInput from "@/components/ui/ArgInput.vue";
import AutocompleteText from "@/components/ui/AutocompleteText.vue";
import type {KeyValCollection} from "@/utils/useKeyValCollection.ts";
import Splitter from "@/components/ui/Splitter.vue";

const props = defineProps<{
    code: string // for local-storage-key
    kvCollection: KeyValCollection,
    onChange: (kv: KeyVal) => any,
    skip?: (kv: KeyVal) => boolean,
    autocomplete?: boolean,
}>()

const localStorageKey = `env-data-table-splitter-${props.code}`;

function onFileChange(p: KeyVal, e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] || null;
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            p.value = reader.result as string;
            p.fileName = file.name;
            props.onChange(p);
        };
        reader.readAsDataURL(file);
    }
}

function clickFileInput(p: KeyVal) {
    const input = document.getElementById(`file-input-${p.id}`) as HTMLInputElement;
    if (input) {
        input.click();
    }
}
</script>

<template>
    <div class="space-y-1 grid " style="grid-template-columns: auto 1fr auto">
        <template v-for="(p) in kvCollection.keyVals" :key="p.id">
            <template v-if="!skip || !skip(p)">
                <span v-if="p.required" class="inline-block py-1 -ml-4">
                    <span class="icon icon-[gg--asterisk]"> </span>
                </span>
                <i v-else></i>
                <Splitter
                    base-side="left"
                    default-width="50%"
                    class="w-auto h-auto border-none"
                    :local-storage-key="localStorageKey"
                    dragger-invisible
                >
                    <template #left>
                        <ArgInput
                            v-model="p.key"
                            @update:model-value="() => onChange(p)"
                            placeholder="Key"
                        />
                    </template>
                    <template #right>
                        <div class="flex-1 flex gap-1 items-stretch">
                            <slot name="center" :item="p"></slot>
                            <template v-if="p.type == 'file'">
                                <ArgInput
                                    :model-value="p.fileName || ''"
                                    readonly
                                    @click="clickFileInput(p)"
                                    class="*:*:cursor-pointer!"
                                />
                                <!--<label-->
                                <!--    :for="`file-input-${p.id}`"-->
                                <!--    class="border flex-1"-->
                                <!--&gt;</label>-->
                                <input
                                    :id="`file-input-${p.id}`"
                                    type="file"
                                    @change="e => onFileChange(p, e)"
                                    class="file-input file-input-bordered w-full max-w-xs hidden"
                                />
                            </template>
                            <AutocompleteText
                                v-else-if="autocomplete"
                                :model-value="p.value?.toString()"
                                @update:modelValue="v => p.value = v || ''"
                            />
                            <ArgInput
                                v-else
                                :model-value="p.value?.toString()"
                                @update:modelValue="v => p.value = v"
                                @update:model-value="() => onChange(p)"
                                placeholder="Value"
                                autosize
                            />
                        </div>
                    </template>
                </Splitter>
                <span
                    @click="() => kvCollection.remove(p)"
                    class="px-1 py-2 text-surface-600 hover:text-surface-200 cursor-pointer transition-colors"
                    v-if="!p.locked"
                >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clip-rule="evenodd"/>
                        </svg>
                    </span>
                <i v-else></i>
                <div v-if="p.desc" class="text-xs opacity-70 pl-1 -mt-1 col-span-full">{{ p.desc }}</div>
            </template>
        </template>
    </div>
</template>