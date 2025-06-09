import {createApp} from 'vue'
import './css/style.css'
import App from './App.vue'
import {useDb} from "@/utils/useDb.ts";

useDb().init().then(() => {
    createApp(App)
        .mount('#app')
})
