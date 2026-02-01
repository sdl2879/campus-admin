// src/utils/service.js
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';

const service = axios.create({
    baseURL: 'http://localhost:8080', // 注意：不包含 /api
    timeout: 10000
});

// 请求拦截器：严格处理 Token
service.interceptors.request.use(
    (config) => {
        const rawToken = localStorage.getItem('token');

        // ✅ 严格校验：必须是有效非空字符串，且不是 "null"/"undefined"
        if (
            typeof rawToken === 'string' &&
            rawToken.trim() !== '' &&
            rawToken !== 'null' &&
            rawToken !== 'undefined'
        ) {
            config.headers.Authorization = `Bearer ${rawToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
service.interceptors.response.use(
    (response) => response.data || {},
    async (error) => {
        if (error.response?.status === 401) {
            if (window.isHandling401) return Promise.reject(error);
            window.isHandling401 = true;

            try {
                await ElMessageBox.confirm('登录已失效，请重新登录', '提示', {
                    confirmButtonText: '重新登录',
                    cancelButtonText: '取消',
                    type: 'warning'
                });
                localStorage.clear();
                router.push('/admin/login');
            } catch {
                ElMessage.info('已取消登录');
            } finally {
                window.isHandling401 = false;
            }
            return Promise.reject(error);
        }

        const msg = error.response?.data?.msg || '请求失败';
        ElMessage.error(msg);
        return Promise.resolve({ code: -1, msg });
    }
);

export default service;