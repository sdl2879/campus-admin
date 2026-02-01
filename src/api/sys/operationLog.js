import request from '@/utils/request';
import { ElMessage } from 'element-plus';

// 统一错误处理
function handleRequestError(error, action) {
    let errorMsg = `${action}失败`;
    if (error.response?.data?.msg) errorMsg = `${action}：${error.response.data.msg}`;
    ElMessage.error(errorMsg);
    return Promise.reject(error);
}

// 获取操作日志列表（分页+搜索）
export const getOperationLogList = (params) => {
    const validParams = {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...params
    };
    return request({
        url: '/api/sys/operationLog/list',
        method: 'GET',
        params: validParams
    }).catch(error => handleRequestError(error, '获取操作日志'));
};

// 导出操作日志
export const exportOperationLog = (params) => {
    return request({
        url: '/api/sys/operationLog/export',
        method: 'GET',
        params,
        responseType: 'blob'
    }).catch(error => {
        ElMessage.error('导出操作日志失败：' + (error.response?.data?.msg || '未知错误'));
        return Promise.reject(error);
    });
};

// 清空操作日志
export const clearOperationLog = () => {
    return request({
        url: '/api/sys/operationLog/clear',
        method: 'GET'
    }).catch(error => handleRequestError(error, '清空操作日志'));
};