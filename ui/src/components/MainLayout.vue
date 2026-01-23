<script setup lang="ts">
import {computed, ref} from 'vue'
import EnvironmentsWindow from './EnvironmentsWindow.vue'
import Icon from "@/components/ui/Icon.vue";
import ArgButton from "@/components/ui/ArgButton.vue";
import {useGlobalEnvs} from "@/utils/useGlobalEnvs.ts";
import Splitter from "@/components/ui/Splitter.vue";
import EndpointTabs from "@/components/EndpointTabs.vue";
import EndpointTreeView from "@/components/EndpointTreeView.vue";
import EndpointView from "@/components/EndpointView.vue";
import {useNavState} from "@/utils/useNavState.ts";
import ArgInput from "@/components/ui/ArgInput.vue";
import {Search} from '@element-plus/icons-vue'

const navState = useNavState();
const globalKeyVals = useGlobalEnvs()

const useLocStorage = (key: string, defaultValue: string) => {
    const storedValue = localStorage.getItem(key);
    const data = ref(storedValue ?? defaultValue);

    return computed({
        get: () => data.value,
        set: (val: string) => {
            data.value = val;
            localStorage.setItem(key, val);
        }
    })
};

const isLeftSidebarOpen = useLocStorage('left-sidebar-open', '1');
const isRightSidebarOpen = useLocStorage('right-sidebar-open', '');

const toggle = (what: 'left' | 'right') => {
    if (what === 'left') {
        isLeftSidebarOpen.value = isLeftSidebarOpen.value === '1' ? '' : '1';
    } else {
        isRightSidebarOpen.value = isRightSidebarOpen.value === '1' ? '' : '1';
    }
};

const query = ref('');
</script>

<template>
    <div class="bg-x0 text-black dark:text-gray-100 overflow-y-auto flex flex-col w-screen h-screen">
        <div class="flex items-center  px-2 py-1 gap-2">
            <ArgButton icon-only @click="toggle('left')" severity="raised" class="rounded-full">
                <Icon icon="icon-[tabler--layout-sidebar] text-2xl"/>
            </ArgButton>
            <img src="/src/assets/logo.svg" alt="" class="w-7 h-7">
            <h1 class="mr-auto font-bold  text-2xl flex gap-2 items-center">
                <span style="color: #88D127">Dokie</span>
            </h1>

            <span>Current basepath:</span>
            <span class="font-medium bg-x4 py-0.5 px-2 rounded-md cursor-pointer" @click="toggle('right')">
                {{ globalKeyVals.hostname || 'No hostname set' }}
            </span>
            <ArgButton icon-only @click="toggle('right')" severity="raised" class="rounded-full">
                <Icon icon="icon-[tabler--layout-sidebar-right] text-2xl"/>
            </ArgButton>
        </div>

        <!--splitting main area and environments sidebar-->
        <Splitter
            base-side="right"
            default-width="200px"
            min-width="300px"
            max-width="40%"
            class=" border-x-0"
            local-storage-key="sidebar-mainlayout-splitter"
            :right-hidden="!isRightSidebarOpen"
        >
            <template #left>
                <div class="flex flex-1 overflow-y-auto">
                    <!-- splitting left sidebar and main content area-->
                    <Splitter
                        base-side="left"
                        default-width="200px"
                        min-width="240px"
                        max-width="50%"
                        class=" border-x-0"
                        local-storage-key="endpoints-sidebar-splitter"
                        :left-hidden="!isLeftSidebarOpen"
                    >
                        <template #left>
                            <div class="flex justify-between">
                                <h2 class="flex-1 text-lg font-bold py-2 px-2 text-gray-900 dark:text-white">Endpoints</h2>
                                <ArgInput
                                    v-model="query"
                                    placeholder="Search"
                                    class="w-20! my-2 mr-2"
                                    :prefix-icon="Search"
                                    size="small"
                                />
                            </div>
                            <EndpointTreeView :query="query"/>
                        </template>
                        <template #right>
                            <!-- Content Area -->
                            <div class="flex-1 flex flex-col  overflow-y-auto h-full w-full">
                                <EndpointTabs/>
                                <EndpointView v-if="navState.activeEndpoint" :endpoint="navState.activeEndpoint" :key="navState.activeEndpoint.id"/>
                                <div v-else class="text-center text-gray-500 dark:text-gray-400 mt-10">
                                    Select an endpoint from the tree view to see its details
                                </div>
                            </div>
                        </template>
                    </Splitter>
                </div>
            </template>
            <template #right>
                <div class=" space-y-4 p-2 mb-2 h-full">
                    <EnvironmentsWindow/>
                </div>
            </template>
        </Splitter>
    </div>
</template>
