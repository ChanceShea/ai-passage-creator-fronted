import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import '@/access'

const app = createApp(App)

app.use(createPinia())

app.use(Antd)
app.use(router)
app.provide('locale', zhCN)
app.mount('#app')
