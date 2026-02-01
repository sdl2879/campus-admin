// src/api/admin/deptAdmin.js
import request from '@/utils/request';

/**
 * 获取院系管理员分页列表
 */
export const getDeptAdminPage = (query) => {
    return request({
        url: '/admin/deptAdmin/page',
        method: 'POST',
        data: query
    });
};

/**
 * 获取院系管理员详情
 */
export const getDeptAdminDetail = (id) => {
    return request({
        url: `/admin/deptAdmin/${id}`,
        method: 'GET'
    });
};

/**
 * 新增院系管理员
 */
export const addDeptAdmin = (data) => {
    return request({
        url: '/admin/deptAdmin/add',
        method: 'POST',
        data
    });
};

/**
 * 编辑院系管理员
 */
export const updateDeptAdmin = (data) => {
    return request({
        url: '/admin/deptAdmin/update',
        method: 'POST',
        data
    });
};

/**
 * 更新院系管理员状态（启用/禁用）
 * 后端使用 @RequestBody Map<String, Object> 接收
 */
export const updateDeptAdminStatus = (id, status) => {
    return request({
        url: '/admin/deptAdmin/updateStatus',
        method: 'POST',
        data: { id, status }
    });
};

/**
 * 重置院系管理员密码
 * 后端使用 @RequestBody Map<String, Object> 接收 id
 */
export const resetDeptAdminPwd = (id) => {
    return request({
        url: '/admin/deptAdmin/resetPassword',
        method: 'POST',
        data: { id }
    });
};

/**
 * 导出院系管理员列表
 */
export const exportDeptAdminList = (query) => {
    return request({
        url: '/admin/deptAdmin/export',
        method: 'POST',
        data: query,
        responseType: 'blob'
    });
};

/**
 * 根据院系ID查询启用的院系管理员（用于下拉选择等）
 */
export const getDeptAdminByDeptId = (deptId) => {
    return request({
        url: '/admin/deptAdmin/listByDeptId',
        method: 'GET',
        params: { deptId }
    });
};