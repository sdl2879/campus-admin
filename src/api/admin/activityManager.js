// src/api/admin/activityManager.js
import request from '@/utils/request';

/**
 * 获取活动管理员分页列表
 */
export const getActivityManagerPage = (query) => {
    return request({
        url: '/admin/activityManager/page',
        method: 'POST',
        data: query
    });
};

/**
 * 获取详情
 */
export const getActivityManagerDetail = (id) => {
    return request({
        url: `/admin/activityManager/${id}`,
        method: 'GET'
    });
};

/**
 * 新增
 */
export const addActivityManager = (data) => {
    return request({
        url: '/admin/activityManager/add',
        method: 'POST',
        data
    });
};

/**
 * 编辑
 */
export const updateActivityManager = (data) => {
    return request({
        url: '/admin/activityManager/update',
        method: 'POST',
        data
    });
};

/**
 * 删除
 */
export const deleteActivityManager = (id) => {
    return request({
        url: `/admin/activityManager/${id}`,
        method: 'DELETE'
    });
};

/**
 * 更新状态（启用/禁用）
 */
export const updateActivityManagerStatus = (id, status) => {
    return request({
        url: '/admin/activityManager/updateStatus',
        method: 'POST',
        data: { id, status } // ✅ 统一用 data
    });
};

/**
 * 资质审核
 */
export const auditQualification = (data) => {
    return request({
        url: '/admin/activityManager/auditQualification',
        method: 'POST',
        data
    });
};

/**
 * 重置密码
 */
export const resetActivityManagerPwd = (id) => {
    return request({
        url: '/admin/activityManager/resetPassword',
        method: 'POST',
        data: { id } // ✅ 统一用 data
    });
};

/**
 * 导出
 */
export const exportActivityManagerList = (query) => {
    return request({
        url: '/admin/activityManager/export',
        method: 'POST',
        data: query,
        responseType: 'blob'
    });
};

/**
 * 根据院系ID查询
 */
export const getActivityManagerByDeptId = (deptId, qualificationStatus) => {
    return request({
        url: '/admin/activityManager/listByDeptId',
        method: 'GET',
        params: { deptId, qualificationStatus }
    });
};