// 导入请求封装（确保 @/utils/request.js 存在）
import request from '@/utils/request'

/**
 * 管理员修改密码接口
 * @param {Object} data - 参数对象
 * @param {string} data.oldPwd - 原密码
 * @param {string} data.newPwd - 新密码
 * @returns {Promise} 请求Promise
 */
export const changePassword = (data) => {
    // 前端参数校验
    if (!data.oldPwd) {
        ElMessage.warning('请输入原密码')
        return Promise.reject(new Error('原密码不能为空'))
    }
    if (!data.newPwd || data.newPwd.length < 6) {
        ElMessage.warning('新密码不能为空且不少于6位')
        return Promise.reject(new Error('新密码格式错误'))
    }

    // 调用后端接口
    return request({
        url: '/api/user/admin/changePwd', // 匹配后端接口路径
        method: 'POST',
        data: data,
        // 自动携带token（权限校验）
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).catch(error => {
        // 统一异常处理
        const msg = error.response?.data?.msg || '修改密码失败，请重试'
        ElMessage.error(msg)
        return Promise.reject(error)
    })
}

// 可选：添加获取管理员信息接口（如需扩展）
export const getAdminInfo = () => {
    return request({
        url: '/api/user/admin/info',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
}