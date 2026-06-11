import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/theme/element-theme.scss'
import '@/theme/element-theme-dark.scss'
import '@/theme/layout.scss'
import '@/theme/common.scss'
import '@/theme/tailwind.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
