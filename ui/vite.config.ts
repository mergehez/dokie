import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import vueDevTools from 'vite-plugin-vue-devtools'
import {viteSingleFile} from "vite-plugin-singlefile";

export default defineConfig({
    server: {
        port: 8082,
    },
    plugins: [
        tailwindcss(),
        viteSingleFile(),
        vue(),
        vueDevTools(),
    ],
    css: {
        postcss: {
            // plugins: [tailwind(), autoprefixer()],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        minify: true,
    }
})
