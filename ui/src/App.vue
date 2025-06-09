<script setup lang="ts">
import {ref} from 'vue'
import EndpointsSidebar from './components/EndpointsSidebar.vue'
import EnvironmentBar from './components/EnvironmentBar.vue'
import {useSpec} from "@/utils/useSpec.ts";
import {useAppConfig} from "@/utils/useAppConfig.ts";
import {distinct} from "@/utils/utils.ts";
import type {OpenAPIV3} from "@/utils/types.ts";
import {useDb} from "@/utils/useDb.ts";

const apiSpec = ref<OpenAPIV3>()
const config = useAppConfig();

fetch(config.openApiJsonUrl)
    .then(r => r.json())
    .then(async (spec: OpenAPIV3) => {
        config.hostnames = distinct([...(spec.servers?.map(t => t.url) ?? []), ...config.hostnames]);
        await useDb().init(config.openApiJsonUrl);
        apiSpec.value = useSpec(spec).spec;
    })
</script>

<template>
    <div v-if="!!apiSpec"
         class="bg-x1 text-black dark:text-gray-100 overflow-y-auto flex flex-col h-screen">
        <EnvironmentBar/>
        <EndpointsSidebar/>
    </div>
    <div v-else class="fixed w-screen h-screen flex items-center justify-center text-4xl">
        <i class="icon icon-[mingcute--loading-fill] animate-spin text-5xl mr-3"></i>
        Fetching endpoints...
    </div>
</template>
