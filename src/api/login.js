import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token && token !== 'null' && token !== 'undefined') {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    },
    (error) => {
        ElMessage.error('请求参数解析失败')
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        const res = response.data
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败，请重试')
            return Promise.reject(res)
        }
        return res
    },
    (error) => {
        if (!error.response) {
            ElMessage.error('网络异常，请检查后端服务是否启动')
            return Promise.reject(error)
        }

        const status = error.response.status
        const url = error.config?.url || '未知接口'

        if (status === 404) ElMessage.error(`接口不存在：${url}`)
        else if (status === 401) {
            ElMessage.error('登录过期，请重新登录')
            localStorage.removeItem('token')
            router.push('/login').catch(() => {})
        } else if (status === 403) ElMessage.error('无权限操作，请联系超级管理员')
        else if (status === 500) ElMessage.error('服务器错误，数据保存失败')
        else if (status === 400) ElMessage.error('参数错误，请检查输入内容')
        else ElMessage.error(`请求失败[${status}]：${url}`)

        return Promise.reject(error)
    }
)

// 普通用户登录
export const login= (params) => {
    if (!params.username || !params.password) {
        ElMessage.warning('请输入用户名和密码')
        return Promise.reject(new Error('参数不完整'))
    }
    return service.post('/user/login', params)
}

// ✅ 新增：管理员登录接口（解决你导入的 loginAdmin）
export const loginAdmin = (params) => {
    if (!params.username || !params.password) {
        ElMessage.warning('请输入管理员账号和密码')
        return Promise.reject(new Error('参数不完整'))
    }
    return service.post('/user/admin/login', params)
}

// 角色相关接口
export const getRoleList = (params = {}) => {
    return service.get('/sys/role/list', { params })
}

export const addRole = (data) => {
    if (!data.roleName) {
        ElMessage.warning('角色名称不能为空')
        return Promise.reject(new Error('角色名称不能为空'))
    }
    if (!data.roleCode) {
        ElMessage.warning('角色编码不能为空')
        return Promise.reject(new Error('角色编码不能为空'))
    }
    return service.post('/sys/role/add', data)
}

export const deleteRole = (roleId) => {
    if (!roleId) {
        ElMessage.warning('角色ID不能为空')
        return Promise.reject(new Error('角色ID不能为空'))
    }
    return service.delete(`/sys/role/delete/${roleId}`)
}

export const getRolePermission = (roleId) => {
    if (!roleId || roleId === 'undefined' || roleId === null) {
        ElMessage.warning('角色ID不能为空')
        return Promise.reject(new Error('角色ID不能为空'))
    }
    return service.get(`/sys/role/permission/${roleId}`)
}

export const saveRolePermission = (data) => {
    if (!data.roleId || !data.permissionIds) {
        ElMessage.warning('角色ID和权限ID不能为空')
        return Promise.reject(new Error('参数不完整'))
    }
    return service.post('/sys/role/savePermission', data)
}

export const getRoleLog = (params) => {
    if (!params.roleId) {
        ElMessage.warning('角色ID不能为空')
        return Promise.reject(new Error('角色ID不能为空'))
    }
    return service.get('/sys/role/log', { params })
}

export const getUserList = (params) => {
    return service.get('/sys/user/list', { params })
}

export const getActivityList = (params) => {
    return service.get('/activity/list', { params })
}

// ✅ 修复拼写错误：servicee -> service
export default service