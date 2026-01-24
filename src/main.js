import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 1. 导入 Pinia 核心方法
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 2. 创建 Pinia 实例
const pinia = createPinia()

const app = createApp(App)
// 3. 先注册 Pinia（必须在组件渲染前！）
app.use(pinia)
// 再注册其他插件
app.use(ElementPlus)
app.use(router)

// 全局注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')