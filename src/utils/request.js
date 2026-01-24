// src/utils/request.js
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'

// 创建 axios 实例（开发环境-适配前端8080端口+代理）
const service = axios.create({
    baseURL: '/api', // 核心：相对路径，由Vite代理转发到后端
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器：添加管理端Token（adminToken）+ Bearer前缀
service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('adminToken')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器：统一处理管理端接口结果
service.interceptors.response.use(
    response => {
        const res = response.data
        // 管理端接口统一返回格式：{code:200, msg:"成功", data:{}}
        if (res.code !== 200) {
            ElMessage.error(res.msg || '操作失败')
            // 401：登录过期/未登录，跳管理端登录页
            if (res.code === 401) {
                ElMessageBox.confirm(
                    '登录已过期，请重新登录管理端',
                    '权限验证',
                    {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).then(() => {
                    localStorage.removeItem('adminToken')
                    router.push('/admin/login')
                })
            }
            return Promise.reject(res)
        }
        return res // 成功返回完整结果：{code:200, msg, data}
    },
    error => {
        // 网络错误/服务器错误友好提示
        const errMsg = error.message || '服务器请求失败'
        ElMessage.error(`管理端接口错误：${errMsg}`)
        return Promise.reject(error)
    }
)

export default service