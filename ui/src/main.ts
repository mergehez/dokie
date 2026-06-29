import { createApp } from 'vue';
import App from './App.vue';
import './css/style.css';

const CDN = 'https://cdn.jsdelivr.net/npm/ace-builds@1.44.0/src-noconflict';
const LINTER_CDN = 'https://www.unpkg.com/ace-linters@2.2.0/build/ace-linters.js';

// Load Ace core first, then theme + language tools + linter
loadScript(`${CDN}/ace.js`)
    .then(() => {
        return Promise.all([loadScript(`${CDN}/theme-monokai.js`), loadScript(`${CDN}/ext-language_tools.js`), loadScript(LINTER_CDN)]);
    })
    .then(() => {
        const ace = (window as any).ace;
        ace.config.set('basePath', CDN);
        createApp(App).mount('#app');
    });

function loadScript(src: string): Promise<void> {
    return new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        document.head.appendChild(s);
    });
}
