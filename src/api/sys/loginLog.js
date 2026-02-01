import request from '@/utils/request';
import { ElMessage } from 'element-plus';

// 统一错误处理
function handleRequestError(error, action) {
    let errorMsg = `${action}失败`;
    if (error.response?.data?.msg) errorMsg = `${action}：${error.response.data.msg}`;
    ElMessage.error(errorMsg);
    return Promise.reject(error);
}

// 获取登录日志列表（分页+搜索）
export const getLoginLogList = (params) => {
    const validParams = {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...params
    };
    return request({
        url: '/api/sys/loginLog/list',
        method: 'GET',
        params: validParams
    }).catch(error => handleRequestError(error, '获取登录日志'));
};

// 导出登录日志
export const exportLoginLog = (params) => {
    return request({
        url: '/api/sys/loginLog/export',
        method: 'GET',
        params,
        responseType: 'blob'
    }).catch(error => {
        ElMessage.error('导出登录日志失败：' + (error.response?.data?.msg || '未知错误'));
        return Promise.reject(error);
    });
};

// 清空登录日志
export const clearLoginLog = () => {
    return request({
        url: '/api/sys/loginLog/clear',
        method: 'GET'
    }).catch(error => handleRequestError(error, '清空登录日志'));
};