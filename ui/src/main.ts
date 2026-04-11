import { loader } from '@guolao/vue-monaco-editor';
import { createApp } from 'vue';
import App from './App.vue';
import './css/style.css';

loader.config({
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs',
    },
});

createApp(App).mount('#app');
