// src/utils/request.js
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'
p
// 创建axios实例
const service = axios.create({
    baseURL: 'http://localhost:8080/campus-activity', // 后端接口前缀
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器（添加token）
service.intercetors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = token // 携带token
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器（统一处理结果）
service.interceptors.response.use(
    response => {
        const res = response.data
        // 成功：code=200
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败')
            // token过期/无效，跳登录页
            if (res.code === 401) {
                ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
                    confirmButtonText: '确定',
                    type: 'warning'
                }).then(() => {
                    localStorage.removeItem('token')
                    router.push('/login')
                })
            }
            return Promise.reject(res)
        } else {
            return res
        }
    },
    error => {
        ElMessage.error('服务器错误：' + error.message)
        return Promise.reject(error)
    }
)

export default service