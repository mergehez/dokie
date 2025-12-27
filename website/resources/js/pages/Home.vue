<script setup lang="ts">
import FeatureBox from "@/components/FeatureBox.vue";
import {RouterLink} from "vue-router";
import Layout from "@/components/Layout.vue";
</script>

<template>
    <Layout isHome>
        <div class="text-white dark:border-b border-x5 bg-xhome">
            <section class="pt-20 container mx-auto  px-2 sm:px-4 text-center  relative border-x-0!">
                <h1 class="text-5xl font-bold mb-4">
                    Bring your API documentation<br>
                    to the next level with Dokie
                </h1>
                <p class="text-xl opacity-80 mb-8">
                    Say goodbye to boring API clients. Dokie makes it easy to create<br>
                    beautiful, interactive, and user-friendly API clients for you team. <br>
                </p>

                <RouterLink
                    :as="RouterLink"
                    to="/documentation"
                    class=" bg-white text-black hover:bg-gray-300  text-lg py-2 px-4 rounded-md">
                    Documentation
                </RouterLink>

                <div class="-mt-20 sm:-mx-5 z-10" style="transform: translateY(8rem);">
                    <img
                        src="../../../public/screenshot.png"
                        alt="dokie screenshot"
                        class="rounded-lg overflow-hidden border-2 border-gray-800 shadow-lg mx-auto w-full"
                        style="max-width: min(calc(100vw - 2rem), 56rem);"
                    >
                </div>
            </section>
        </div>
        <section id="features" class="pt-42 pb-20 container  flex-1">
            <div class="my-24 text-center">
                <span class="px-5 py-2.5 rounded-full bg-x0 text-t0 invert mx-4">
                    Features
                </span>

                <h2 class="text-5xl  mt-12 px-2">
                    Powerful features for <br class="max-sm:hidden">
                    better API documentation
                </h2>

                <h3 class="text-t1 mt-6 max-w-2xl mx-auto px-2">
                    Dokie provides a comprehensive suite of advanced features and tools <br class="max-sm:hidden">
                    that empower your entire team to efficiently create outstanding API documentation.
                </h3>
            </div>

            <div class="grid md:grid-cols-2 border-t border-x4 *:p-7 *:border-b *:border-x4 ">
                <FeatureBox :index="0" title="OpenAPI Support">
                    Automatically generates the UI based on OpenAPI specifications to streamline your API documentation process.
                </FeatureBox>
                <FeatureBox :index="1" title="Configurable">
                    Set predefined variables, headers, and postscripts to customize the API client for your team's needs.
                </FeatureBox>
                <FeatureBox :index="2" title="Basepath Switching">
                    Easily add and switch between different basepaths, making it simple to work with multiple environments.
                </FeatureBox>
                <FeatureBox :index="3" title="Favorites">
                    Mark endpoints as favorites for quick access, allowing your team to focus on the most important parts of your API.
                </FeatureBox>
                <FeatureBox :index="4" title="Environment Variables">
                    Add/remove environment variables to manage sensitive data like API keys, ensuring secure and efficient API interactions.
                </FeatureBox>
                <FeatureBox :index="5" title="Global Headers">
                    Set global headers for all requests to maintain consistency and simplify API calls across your documentation.
                </FeatureBox>
                <FeatureBox :index="6" title="Postscripts">
                    Add custom JS-scripts that run after a request is made, allowing you to set environment variables or global headers using the response.
                </FeatureBox>
                <FeatureBox :index="7" title="Endpoint Configuration">
                    Easily add path/query parameters, headers and body to requests. You can use environment variables just like in Postman.
                </FeatureBox>

                <FeatureBox :index="8" title="Persistent State" class="col-span-full ">
                    Following changes are stored in your local machine and not shared with your team members using the same project:

                    <div class="flex flex-wrap mt-2 gap-2">
                        <span class="alert alert-light px-2 py-0.5 text-sm">Environment variables</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Global headers</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Favorite endpoints</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Custom basepaths</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Current basepath</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Path/Query parameters</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Headers</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Postscripts</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Tabs state</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Sidebar states</span>
                        <span class="alert alert-light px-2 py-0.5 text-sm">Splitter states</span>
                    </div>
                </FeatureBox>
            </div>
        </section>
    </Layout>
</template>

