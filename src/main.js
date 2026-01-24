import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 仅保留核心注册，删除所有手动组件注册（避免重复）
const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus) // 只靠这一行全局注册 Element Plus
app.use(router)

// 仅注册图标，不注册其他组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')