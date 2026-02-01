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
    } else if (error.message) {
        errorMsg = `${action}：${error.message}`;
    }
    ElMessage.error(errorMsg);
    console.error(`${action}错误：`, error);
    return Promise.reject(error);
}

// 获取权限列表（树形）
export const getPermissionList = (params = {}) => {
    return request({
        url: '/api/sys/permission/list',
        method: 'GET',
        params
    }).catch(error => handleRequestError(error, '获取权限列表'));
};

// 新增权限
export const addPermission = (data) => {
    if (!data?.permissionName) {
        ElMessage.warning('权限名称不能为空');
        return Promise.reject(new Error('权限名称缺失'));
    }
    if (!data?.permissionType) {
        ElMessage.warning('权限类型不能为空');
        return Promise.reject(new Error('权限类型缺失'));
    }
    return request({
        url: '/api/sys/permission/add',
        method: 'POST',
        data
    }).catch(error => handleRequestError(error, '新增权限'));
};

// 编辑权限
export const editPermission = (data) => {
    if (!data?.id) {
        ElMessage.warning('权限ID不能为空');
        return Promise.reject(new Error('权限ID缺失'));
    }
    return request({
        url: '/api/sys/permission/edit',
        method: 'POST',
        data
    }).catch(error => handleRequestError(error, '编辑权限'));
};

// 删除权限
export const deletePermission = (id) => {
    if (!id) {
        ElMessage.warning('权限ID不能为空');
        return Promise.reject(new Error('权限ID缺失'));
    }
    return request({
        url: `/api/sys/permission/delete/${id}`,
        method: 'GET'
    }).catch(error => handleRequestError(error, '删除权限'));
};

// 获取权限下拉列表
export const getPermissionSelect = () => {
    return request({
        url: '/api/sys/permission/select',
        method: 'GET'
    }).catch(error => handleRequestError(error, '获取权限下拉列表'));
};