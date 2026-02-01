import request from '@/utils/request';
import { ElMessage } from 'element-plus';

// 统一错误处理
function handleRequestError(error, action) {
    let errorMsg = `${action}失败`;
    if (error.response?.status === 401) {
        errorMsg = `${action}：登录态已失效，请重新登录`;
        localStorage.removeItem('token');
    } else if (error.response?.data?.msg) {
        errorMsg = `${action}：${error.response.data.msg}`;
    }
    ElMessage.error(errorMsg);
    console.error(`${action}错误：`, error);
    return Promise.reject(error);
}

// 获取用户列表（分页+搜索）
export const getUserList = (params) => {
    const validParams = {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...params
    };
    return request({
        url: '/api/sys/user/list',
        method: 'GET',
        params: validParams
    }).catch(error => handleRequestError(error, '获取用户列表'));
};

// 新增用户
export const addUser = (data) => {
    if (!data?.userName) {
        ElMessage.warning('用户名不能为空');
        return Promise.reject(new Error('用户名缺失'));
    }
    if (!data?.password) {
        ElMessage.warning('密码不能为空');
        return Promise.reject(new Error('密码缺失'));
    }
    if (!data?.roleId) {
        ElMessage.warning('请为用户分配角色');
        return Promise.reject(new Error('角色ID缺失'));
    }
    return request({
        url: '/api/sys/user/add',
        method: 'POST',
        data
    }).catch(error => handleRequestError(error, '新增用户'));
};

// 编辑用户
export const editUser = (data) => {
    if (!data?.id) {
        ElMessage.warning('用户ID不能为空');
        return Promise.reject(new Error('用户ID缺失'));
    }
    return request({
        url: '/api/sys/user/edit',
        method: 'POST',
        data
    }).catch(error => handleRequestError(error, '编辑用户'));
};

// 更新用户状态
export const updateUserStatus = (data) => {
    if (!data?.id || !data?.status) {
        ElMessage.warning('用户ID和状态不能为空');
        return Promise.reject(new Error('参数缺失'));
    }
    return request({
        url: '/api/sys/user/updateStatus',
        method: 'POST',
        data
    }).catch(error => handleRequestError(error, '更新用户状态'));
};

// 重置用户密码
export const resetUserPwd = (id) => {
    if (!id) {
        ElMessage.warning('用户ID不能为空');
        return Promise.reject(new Error('用户ID缺失'));
    }
    return request({
        url: `/api/sys/user/resetPwd/${id}`,
        method: 'GET'
    }).catch(error => handleRequestError(error, '重置用户密码'));
};

// 给用户分配角色
export const assignUserRole = (data) => {
    if (!data?.userId || !data?.roleId) {
        ElMessage.warning('用户ID和角色ID不能为空');
        return Promise.reject(new Error('参数缺失'));
    }
    return request({
        url: '/api/sys/user/assignRole',
        method: 'POST',
        data
    }).catch(error => handleRequestError(error, '分配用户角色'));
};