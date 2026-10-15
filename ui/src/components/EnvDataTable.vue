<script setup lang="ts">
import ArgInput from '@/components/ui/ArgInput.vue';
import AutocompleteText from '@/components/ui/AutocompleteText.vue';
import Splitter from '@/components/ui/Splitter.vue';
import { getMaskedOverride, isSecretName, isMasked as resolveMasked, setMaskedOverride } from '@/utils/maskedKeys.ts';
import type { KeyVal } from '@/utils/useDb.ts';
import type { KeyValCollection } from '@/utils/useKeyValCollection.ts';
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus';

const props = defineProps<{
    code: string; // for local-storage-key
    kvCollection: KeyValCollection;
    onChange: (kv: KeyVal) => any;
    skip?: (kv: KeyVal) => boolean;
    autocomplete?: boolean;
    isPredefined?: (kv: KeyVal) => boolean;
}>();

const localStorageKey = `env-data-table-splitter-${props.code}`;

function isMasked(p: KeyVal): boolean {
    return resolveMasked(p);
}

function isPredefinedRow(p: KeyVal): boolean {
    return props.isPredefined ? props.isPredefined(p) : Boolean(p.locked);
}

function onKeyChange(p: KeyVal) {
    if (props.isPredefined) {
        p.locked = props.isPredefined(p);
    }
    // Keep auto-masking in sync with the key name until the user explicitly toggles this row.
    if (getMaskedOverride(p.id) === undefined) {
        p.masked = isSecretName(p.key);
    }
    props.onChange(p);
}

function onMenuCommand(p: KeyVal, command: 'mask' | 'unmask' | 'remove') {
    if (command === 'remove') {
        if (isPredefinedRow(p)) return;
        props.kvCollection.remove(p);
        return;
    }
    const masked = command === 'mask';
    p.masked = masked;
    setMaskedOverride(p.id, masked);
    props.onChange(p);
}

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

function onInputChange(p: KeyVal, newValue?: string) {
    p.value = newValue ?? p.value;
    props.onChange(p);
}
</script>

<template>
    <div class="space-y-1 grid" style="grid-template-columns: auto 1fr auto">
        <template v-for="p in kvCollection.keyVals" :key="p.id">
            <template v-if="!skip || !skip(p)">
                <span v-if="p.required" class="inline-block py-1 -ml-4">
                    <span class="icon icon-[gg--asterisk]"> </span>
                </span>
                <i v-else></i>
                <Splitter base-side="left" default-width="50%" class="w-auto h-auto border-none" :local-storage-key="localStorageKey" dragger-invisible>
                    <template #left>
                        <ArgInput v-model="p.key" @update:model-value="() => onKeyChange(p)" placeholder="Key" />
                    </template>
                    <template #right>
                        <div class="flex-1 flex gap-1 items-stretch">
                            <slot name="center" :item="p"></slot>
                            <template v-if="p.type == 'file'">
                                <ArgInput :model-value="p.fileName || ''" readonly @click="clickFileInput(p)" class="*:*:cursor-pointer!" />
                                <!--<label-->
                                <!--    :for="`file-input-${p.id}`"-->
                                <!--    class="border flex-1"-->
                                <!--&gt;</label>-->
                                <input :id="`file-input-${p.id}`" type="file" @change="(e) => onFileChange(p, e)" class="file-input file-input-bordered w-full max-w-xs hidden" />
                            </template>
                            <AutocompleteText v-else-if="autocomplete" :model-value="p.value?.toString()" :masked="isMasked(p)" @update:modelValue="(v) => onInputChange(p, v)" />
                            <ArgInput
                                v-else
                                :model-value="p.value?.toString()"
                                :type="isMasked(p) ? 'password' : 'text'"
                                @update:modelValue="(v) => onInputChange(p, v)"
                                placeholder="Value"
                                autosize
                            />
                        </div>
                    </template>
                </Splitter>
                <ElDropdown :tabindex="-1" trigger="click" @command="(cmd) => onMenuCommand(p, cmd as 'mask' | 'unmask' | 'remove')">
                    <span class="px-1 py-2 text-surface-600 hover:text-surface-200 cursor-pointer transition-colors outline-none">
                        <i class="icon icon-[mdi--dots-vertical] block size-4"></i>
                    </span>
                    <template #dropdown>
                        <ElDropdownMenu>
                            <ElDropdownItem v-if="isMasked(p)" command="unmask"> Unmask value </ElDropdownItem>
                            <ElDropdownItem v-else command="mask"> Mask value </ElDropdownItem>
                            <ElDropdownItem v-if="!isPredefinedRow(p)" command="remove" divided>
                                <i class="icon icon-[mdi--delete-outline] mr-2"></i>
                                Remove
                            </ElDropdownItem>
                        </ElDropdownMenu>
                    </template>
                </ElDropdown>
                <div v-if="p.desc" class="text-xs opacity-70 pl-1 -mt-1 col-span-full">{{ p.desc }}</div>
            </template>
        </template>
    </div>
</template>
