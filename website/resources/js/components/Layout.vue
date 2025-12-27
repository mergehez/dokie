<script setup lang="ts">
import {onMounted, ref} from 'vue';
import ArgButton from "@/components/ui/ArgButton.vue";
import {RouterLink} from "vue-router";

const isDarkMode = ref(false);

const props = defineProps<{
    isHome?: boolean
}>()


function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('dokie-dark', '1');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('dokie-dark', '0');
    }
}

onMounted(() => {
    // set dark mode based on system preference if no preference is set
    if (localStorage.getItem('dokie-dark') === null) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            isDarkMode.value = true;
            document.documentElement.classList.add('dark');
        }
    } else {
        isDarkMode.value = localStorage.getItem('dokie-dark') === '1';
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
})

function animateToFeatureSection() {
    const featureSection = document.getElementById('features');
    if (featureSection) {
        featureSection.scrollIntoView({behavior: 'smooth'});
    }
}
</script>

<template>
    <div :class="[isDarkMode ? 'dark' : '', 'min-h-screen flex flex-col']">
        <nav class="" :class=" isHome ? 'text-white bg-xhome': 'border-b border-x5'">
            <div
                class="container border-0! mx-auto px-4 py-3 flex items-center justify-between"
                :class=" isHome ? ' text-white bg-xhome': ''"
            >
                <div class="flex items-center space-x-4">
                    <img src="../../../public/logo.svg" alt="" class="w-7 h-7">
                    <router-link to="/">
                        <h1 class="mr-auto font-bold  text-2xl flex gap-2 items-center">
                            <span style="color: #88D127">Dokie</span>
                        </h1>
                    </router-link>
                </div>
                <div class="flex items-center space-x-2">
                    <ArgButton as="a" severity="raised" href="#features" @click.prevent="animateToFeatureSection" class="max-sm:hidden hover:bg-gray-800 hover:border-gray-700">Features</ArgButton>
                    <ArgButton :as="RouterLink" severity="raised" to="/documentation" class="sm:hidden hover:bg-gray-800 hover:border-gray-700">Docs</ArgButton>
                    <ArgButton :as="RouterLink" severity="raised" to="/documentation" class="max-sm:hidden hover:bg-gray-800 hover:border-gray-700">Documentation</ArgButton>
                    <ArgButton as="a" severity="raised" href="/dokie" class="hover:bg-gray-800 hover:border-gray-700">Demo</ArgButton>
                    <ArgButton severity="raised" @click="toggleDarkMode" class="hover:bg-gray-800 hover:border-gray-700">
                        <i class="icon text-xl" :class="isDarkMode ? 'icon-mingcute--sun-fill' : 'icon-mingcute--moon-fill'"></i>
                    </ArgButton>
                    <ArgButton as="a" severity="raised" href="https://github.com/mergehez/dokie" target="_blank" class="hover:bg-gray-800 hover:border-gray-700">
                        <i class="icon text-xl icon-mdi--github"></i>
                    </ArgButton>
                </div>
            </div>
        </nav>
        <main class="flex-1 flex flex-col">
            <slot/>
        </main>
        <footer class="border-t border-x4">
            <div class="container mx-auto px-4 py-4 text-center text-t2 text-sm">
                © 2025 Dokie. Inspired by Postman
            </div>
        </footer>
    </div>
</template>


