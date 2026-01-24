// src/api/user.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器：添加token
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器：统一处理结果
service.interceptors.response.use(
    (response) => {
        const res = response.data
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败')
            return Promise.reject(res)
        }
        return res
    },
    (error) => {
        ElMessage.error(error.message || '服务器错误')
        return Promise.reject(error)
    }
)

// 登录接口
export const login = (params) => {
    return service.post('/user/login', params)
}

// 用户列表接口
export const getUserList = (params) => {
    return service.get('/sys/user/list', { params })
}

// 活动列表接口
export const getActivityList = (params) => {
    return service.get('/activity/list', { params })
}

export default service