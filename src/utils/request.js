// src/utils/service.js （或 request.js）
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    withCredentials: true
});

// 请求拦截器：添加 Token
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !['undefined', 'null', ''].includes(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器：统一处理
service.interceptors.response.use(
    /**
     * ✅ 关键修复：确保返回一个对象，即使后端返回空/HTML/错误页
     */
    (response) => {
        // 如果后端返回的是非 JSON（如 404 HTML），response.data 可能是字符串
        if (typeof response.data !== 'object' || response.data === null) {
            console.warn('后端返回非 JSON 数据:', response.data);
            return { code: -1, msg: '服务器返回格式错误，请检查接口' };
        }
        return response.data || {}; // 兜底 {}
    },
    async (error) => {
        // 处理 401 未授权
        if (error.response?.status === 401) {
            if (window.isHandling401) return Promise.reject(error);
            window.isHandling401 = true;

            try {
                await ElMessageBox.confirm('登录状态已失效，请重新登录', '提示', {
                    confirmButtonText: '重新登录',
                    cancelButtonText: '取消',
                    type: 'warning'
                });
                // 清除登录信息
                localStorage.removeItem('token');
                localStorage.removeItem('adminInfo');
                localStorage.removeItem('adminRole');
                router.push('/admin/login').catch(() => {});
            } catch {
                ElMessage.info('已取消重新登录');
            } finally {
                window.isHandling401 = false;
            }
            return Promise.reject(error);
        }

        // 处理其他 HTTP 错误（4xx/5xx）
        let msg = '请求失败';
        if (error.response) {
            // 后端返回了 JSON 错误
            if (typeof error.response.data === 'object') {
                msg = error.response.data.msg || `错误 ${error.response.status}`;
            } else {
                // 后端返回 HTML/文本（如 Spring Boot Whitelabel Error）
                msg = `服务器错误 (${error.response.status})`;
            }
        } else if (error.request) {
            // 网络错误（无响应）
            msg = '无法连接到服务器，请检查后端是否启动';
        } else {
            // 其他错误
            msg = error.message || '未知错误';
        }

        ElMessage.error(msg);

        // ✅ 关键：返回一个标准对象，避免前端报错
        return Promise.resolve({
            code: error.response?.status || -1,
            msg
        });
    }
);

export default service;