<script setup lang="ts">
import EndpointView from './EndpointView.vue'
import EndpointTreeView from "@/components/EndpointTreeView.vue";
import {useNavState} from "@/utils/useNavState.ts";
import EndpointTabs from "@/components/EndpointTabs.vue";
import Splitter from "@/components/ui/Splitter.vue";

const sidebar = useNavState();
</script>

<template>
    <div class="flex flex-1 overflow-y-auto">
        <Splitter class="w-full" local-storage-key="endpoints-sidebar-splitter" :default-width="30">
            <template #left>
                <h2 class="text-lg font-semibold py-2 px-2 text-gray-900 dark:text-white">API Endpoints</h2>
                <EndpointTreeView/>
            </template>
            <template #right>
                <!-- Content Area -->
                <div class="flex-1 flex flex-col  overflow-y-auto h-full w-full">
                    <EndpointTabs/>
                    <EndpointView v-if="sidebar.activeEndpoint" :endpoint="sidebar.activeEndpoint" :key="sidebar.activeEndpoint.id"/>
                    <div v-else class="text-center text-gray-500 dark:text-gray-400 mt-10">
                        Select an endpoint from the tree view to see its details
                    </div>
                </div>
            </template>
        </Splitter>
    </div>
</template>