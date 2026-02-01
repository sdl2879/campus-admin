import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router' // 新增：导入路由实例，避免window.location.href跳转

// 创建axios实例（适配环境变量，不硬编码地址）
const service = axios.create({
    // 开发环境用相对路径，由Vite代理转发；生产环境读取.env文件的地址
    baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器：携带token，确保接口有权限访问
service.interceptors.request.use(
    (config) => {
        // 增加空值校验，避免token为null/undefined导致请求头异常
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

// 响应拦截器：统一错误处理，避免报错无反馈
service.interceptors.response.use(
    (response) => {
        const res = response.data
        // 后端返回非200，直接提示错误（适配后端统一返回格式）
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败，请重试')
            return Promise.reject(res)
        }
        return res
    },
    (error) => {
        // 增加网络异常处理，避免error.response为undefined
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
            // 修复：用路由实例跳转，避免window.location.href导致的资源加载异常
            router.push('/login').catch(() => {})
        } else if (status === 403) ElMessage.error('无权限操作，请联系超级管理员')
        else if (status === 500) ElMessage.error('服务器错误，数据保存失败')
        else if (status === 400) ElMessage.error('参数错误，请检查输入内容')
        else ElMessage.error(`请求失败[${status}]：${url}`)

        return Promise.reject(error)
    }
)

// 1. 登录接口（复用，确保权限校验正常）
export const login = (params) => {
    if (!params.username || !params.password) {
        ElMessage.warning('请输入用户名和密码')
        return Promise.reject(new Error('参数不完整'))
    }
    return service.post('/user/login', params)
}

// 2. 角色相关核心接口（新增/删除/列表/权限）
// 获取角色列表（分页，适配大量数据）
export const getRoleList = (params = {}) => {
    return service.get('/sys/role/list', { params })
}
// 新增角色（核心：保存到后端数据库）
export const addRole = (data) => {
    if (!data.roleName) {
        ElMessage.warning('角色名称不能为空')
        return Promise.reject(new Error('角色名称不能为空'))
    }
    if (!data.roleCode) {
        ElMessage.warning('角色编码不能为空')
        return Promise.reject(new Error('角色编码不能为空'))
    }
    if (!/^[A-Z_]+$/.test(data.roleCode)) {
        ElMessage.warning('角色编码仅支持大写字母和下划线')
        return Promise.reject(new Error('角色编码格式错误'))
    }
    return service.post('/sys/role/add', data)
}
// 删除角色（核心：从后端数据库删除）
export const deleteRole = (roleId) => {
    if (!roleId) {
        ElMessage.warning('角色ID不能为空')
        return Promise.reject(new Error('角色ID不能为空'))
    }
    return service.delete(`/sys/role/delete/${roleId}`)
}
// 获取角色权限树（分配权限用，回显已选权限）
export const getRolePermission = (roleId) => {
    if (!roleId || roleId === 'undefined' || roleId === null) {
        ElMessage.warning('角色ID不能为空')
        return Promise.reject(new Error('角色ID不能为空'))
    }
    return service.get(`/sys/role/permission/${roleId}`)
}
// 保存角色权限（核心：将选中的权限保存到后端）
export const saveRolePermission = (data) => {
    if (!data.roleId || !data.permissionIds) {
        ElMessage.warning('角色ID和权限ID不能为空')
        return Promise.reject(new Error('参数不完整'))
    }
    return service.post('/sys/role/savePermission', data)
}

// 3. 角色日志接口（适配，无报错）
export const getRoleLog = (params) => {
    if (!params.roleId) {
        ElMessage.warning('角色ID不能为空')
        return Promise.reject(new Error('角色ID不能为空'))
    }
    return service.get('/sys/role/log', { params })
}

// 4. 其他复用接口（不修改，确保上下文流畅）
export const getUserList = (params) => {
    return service.get('/sys/user/list', { params })
}
export const getActivityList = (params) => {
    return service.get('/activity/list', { params })
}

// 修复：补全缺失的字母e
export default service