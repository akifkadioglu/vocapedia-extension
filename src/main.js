import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { i18n } from './i18n/i18n.js'
import "@/background"

createApp(App)
    .use(autoAnimatePlugin)
    .use(i18n)
    .mount('#app')
