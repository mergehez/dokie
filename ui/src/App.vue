<script setup lang="ts">
import {ref} from 'vue'
import {useSpec} from "@/utils/useSpec.ts";
import {useAppConfig} from "@/utils/useAppConfig.ts";
import {distinct} from "@/utils/utils.ts";
import type {OpenAPIV3} from "@/utils/types.ts";
import {useDb} from "@/utils/useDb.ts";
import MainLayout from "@/components/MainLayout.vue";
import axios, {type AxiosError} from "axios";

const apiSpec = ref<OpenAPIV3>()
const config = useAppConfig();
const errorList = ref<string[]>([]);

function init() {
    errorList.value = [];
    axios.get(config.openApiJsonUrl)
        .then(async (res) => {
            console.log(res)
            const contentType = res.headers["content-type"] || res.headers["Content-Type"];
            if (!contentType.includes('application/json')) {
                throw new Error(`Expected 'application/json' from the api but got '${contentType}'`);
            }

            const spec: OpenAPIV3 = res.data;
            if (typeof spec !== 'object' || spec === null || !spec.paths || typeof spec.paths !== 'object') {
                throw new Error('Invalid OpenAPI spec format');
            }
            config.hostnames = distinct([...(spec.servers?.map(t => t.url) ?? []), ...config.hostnames]);
            await useDb().init(config.openApiJsonUrl);
            apiSpec.value = useSpec(spec).spec;
        })
        .catch((er: AxiosError) => {
            console.log(er, er.status)

            errorList.value = ['Failed to fetch OpenAPI spec: ', er.message || er.toString()];
        });
}

init()

</script>

<template>
    <MainLayout v-if="!!apiSpec"/>

    <div v-else class="fixed w-screen h-screen flex items-center justify-center ">
        <div v-if="errorList.length" class="bg-red-950 px-8 py-5 rounded-lg text-red-200 text-2xl text-center">
            <div v-for="(error, i) in errorList" :key="i">{{ error }}</div>
            <div class="text-sm pt-2">
                Open the devtools console for more information.
            </div>
        </div>
        <div v-else class="text-4xl">
            <i class="icon icon-[mingcute--loading-fill] animate-spin text-5xl mr-3"></i>
            Fetching endpoints...
        </div>
    </div>
</template>
