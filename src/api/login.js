// src/api/login.js（登录相关）
import request from '@/utils/request';

/**
 * 管理端登录
 * @param {Object} params - 登录参数
 * @param {string} params.username - 用户名
 * @param {string} params.password - 密码
 * @returns {Promise} - 请求Promise
 */
export const loginAdmin = (params) => {
    return request({
        url: '/admin/login', // 后端登录接口地址
        method: 'POST',
        data: params
    });
};

/**
 * 管理端退出登录
 * @returns {Promise} - 请求Promise
 */
export const logoutAdmin = () => {
    return request({
        url: '/admin/logout',
        method: 'POST'
    });
};

/**
 * 获取当前登录用户信息
 * @returns {Promise} - 请求Promise
 */
export const getAdminInfo = () => {
    return request({
        url: '/admin/getInfo',
        method: 'GET'
    });
};