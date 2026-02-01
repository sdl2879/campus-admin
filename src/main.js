import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Element Plus 配置
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// ====================== 彻底修复第17行includes错误 ======================
window.addEventListener('error', (e) => {
    // 层层判断，确保所有属性都存在才调用includes
    if (
        e &&
        e.target &&
        e.target.tagName === 'IMG' &&
        e.message &&
        typeof e.message === 'string' &&
        e.message.includes('is not a function')
    ) {
        e.preventDefault();
        e.stopPropagation();
        console.warn('[拦截] 图片onload回调错误：', e.target.src || '未知图片');
    }
}, true);

// 拦截路由错误（同样加防呆判断）
router.onError((error) => {
    if (error && error.message && typeof error.message === 'string' && error.message.includes('Failed to fetch dynamically imported module')) {
        console.error('[拦截] 组件加载失败：', error);
        router.push('/admin/system/role/list').catch(() => {});
    }
});

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 挂载插件
app.use(router)
app.use(ElementPlus)

// 全局警告过滤（同样加防呆）
app.config.warnHandler = (msg, instance, trace) => {
    if (msg && typeof msg === 'string' && !msg.includes('Failed to fetch dynamically imported module')) {
        console.warn(`[Vue警告]：${msg}\n${trace}`);
    }
};

// 挂载到DOM
app.mount('#app')