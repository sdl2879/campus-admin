import request from '@/utils/request';
import { ElMessage } from 'element-plus';

/**
 * 统一请求错误处理函数
 */
function handleRequestError(error, action) {
    let errorMsg = `${action}失败`;

    if (error.response?.status === 401) {
        errorMsg = `${action}：登录态已失效，请重新登录`;
        localStorage.removeItem('token');
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('adminRole');
    } else if (error.response?.status === 403) {
        errorMsg = `${action}：无权限操作，请联系管理员分配权限`;
    } else if (error.response?.data?.msg) {
        errorMsg = `${action}：${error.response.data.msg}`;
    } else if (error.message) {
        errorMsg = `${action}：${error.message}`;
    }

    ElMessage.error(errorMsg);
    console.error(`${action}错误详情：`, error);
    return Promise.reject(error);
}

/**
 * 获取角色分页列表（✅ 主要使用此接口，适配后端 POST /sys/role/page）
 */
export const getRolePage = (query) => {
    // 参数兜底
    const validQuery = {
        pageNum: query?.pageNum || 1,
        pageSize: query?.pageSize || 10,
        ...(query?.roleName && query.roleName.trim() ? { roleName: query.roleName.trim() } : {}),
        ...(query?.status !== undefined ? { status: query.status } : {})
    };

    return request({
        url: '/sys/role/page',      // ✅ 不带 /api
        method: 'POST',             // ✅ 后端是 @PostMapping
        data: validQuery            // ✅ @RequestBody
    }).catch(error => handleRequestError(error, '获取角色列表'));
};

/**
 * 【可选】获取角色列表（GET /list，保留兼容性）
 */
export const getRoleList = (params) => {
    const validParams = {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...(params?.roleName && params.roleName.trim() ? { roleName: params.roleName.trim() } : {}),
        ...(params?.status !== undefined ? { status: params.status } : {})
    };

    return request({
        url: '/sys/role/list',      // ✅ 不带 /api
        method: 'post',
        params: validParams
    }).catch(error => handleRequestError(error, '获取角色列表'));
};

/**
 * 新增角色
 */
export const addRole = (data) => {
    if (!data?.roleName || !data.roleName.trim()) {
        ElMessage.warning('角色名称不能为空');
        return Promise.reject(new Error('角色名称缺失'));
    }
    if (!data?.roleCode || !data.roleCode.trim()) {
        ElMessage.warning('角色标识不能为空');
        return Promise.reject(new Error('角色标识缺失'));
    }
    if (!data?.status || !['0', '1'].includes(String(data.status))) {
        ElMessage.warning('角色状态必须为启用（1）或禁用（0）');
        return Promise.reject(new Error('角色状态非法'));
    }

    const validData = {
        roleName: data.roleName.trim(),
        roleCode: data.roleCode.trim(),
        roleDesc: data.roleDesc?.trim() || '',
        status: data.status
    };

    return request({
        url: '/sys/role/add',       // ✅
        method: 'POST',
        data: validData
    }).catch(error => handleRequestError(error, '新增角色'));
};

/**
 * 编辑角色
 */
export const editRole = (data) => {
    if (!data?.id) {
        ElMessage.warning('角色ID不能为空');
        return Promise.reject(new Error('角色ID缺失'));
    }
    if (!data?.roleName || !data.roleName.trim()) {
        ElMessage.warning('角色名称不能为空');
        return Promise.reject(new Error('角色名称缺失'));
    }
    if (!data?.status || !['0', '1'].includes(String(data.status))) {
        ElMessage.warning('角色状态必须为启用（1）或禁用（0）');
        return Promise.reject(new Error('角色状态非法'));
    }

    const validData = {
        id: data.id,
        roleName: data.roleName.trim(),
        roleDesc: data.roleDesc?.trim() || '',
        status: data.status
    };

    return request({
        url: '/sys/role/edit',      // ✅
        method: 'POST',
        data: validData
    }).catch(error => handleRequestError(error, '编辑角色'));
};

/**
 * 更新角色状态
 */
export const updateRoleStatus = (data) => {
    if (!data?.id) {
        ElMessage.warning('角色ID不能为空');
        return Promise.reject(new Error('角色ID缺失'));
    }
    if (!data?.status || !['0', '1'].includes(String(data.status))) {
        ElMessage.warning('角色状态必须为启用（1）或禁用（0）');
        return Promise.reject(new Error('角色状态非法'));
    }

    return request({
        url: '/sys/role/updateStatus', // ✅
        method: 'POST',
        data: { id: data.id, status: data.status }
    }).catch(error => handleRequestError(error, '更新角色状态'));
};

/**
 * 获取角色权限配置
 */
export const getRolePermission = (roleId) => {
    const params = typeof roleId === 'string' ? { roleId } : roleId;
    if (!params?.roleId) {
        ElMessage.warning('角色ID不能为空');
        return Promise.reject(new Error('角色ID缺失'));
    }

    return request({
        url: '/sys/role/getPermission', // ✅
        method: 'GET',
        params: { roleId: params.roleId }
    }).catch(error => handleRequestError(error, '获取角色权限'));
};

/**
 * 分配角色权限
 */
export const assignRolePermission = (data) => {
    if (!data?.roleId) {
        ElMessage.warning('角色ID不能为空');
        return Promise.reject(new Error('角色ID缺失'));
    }
    if (!Array.isArray(data.permissionIds)) {
        ElMessage.warning('权限ID必须为数组格式');
        return Promise.reject(new Error('权限ID格式非法'));
    }

    const validData = {
        roleId: data.roleId,
        checkedMenuIds: data.permissionIds,
        checkedOperationIds: {},
        dataScope: 'ALL',
        checkedDeptIds: []
    };

    return request({
        url: '/sys/role/savePermission', // ✅
        method: 'POST',
        data: validData
    }).catch(error => handleRequestError(error, '分配角色权限'));
};

// saveRolePermission 与 assignRolePermission 逻辑一致，可复用或保留
export const saveRolePermission = assignRolePermission;

/**
 * 获取角色变更日志
 */
export const getRoleLog = (params) => {
    if (!params?.roleId) {
        ElMessage.warning('角色ID不能为空');
        return Promise.reject(new Error('角色ID缺失'));
    }

    const validParams = {
        roleId: params.roleId,
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...(params?.keyword && { operator: params.keyword, operationContent: params.keyword })
    };

    return request({
        url: '/sys/role/log/list',  // ✅
        method: 'GET',
        params: validParams
    }).catch(error => handleRequestError(error, '获取角色日志'));
};

/**
 * 导出角色变更日志
 */
export const exportRoleLog = (params) => {
    if (!params?.roleId) {
        ElMessage.warning('角色ID不能为空');
        return Promise.reject(new Error('角色ID缺失'));
    }

    const validParams = {
        roleId: params.roleId,
        ...(params?.keyword && { operator: params.keyword, operationContent: params.keyword })
    };

    return request({
        url: '/sys/role/log/export', // ✅
        method: 'GET',
        params: validParams,
        responseType: 'blob'
    }).catch(error => {
        handleRequestError(error, '导出角色日志');
        return Promise.reject(new Error('导出失败'));
    });
};

/**
 * 批量导入角色
 */
export const importRole = (formData) => {
    if (!formData || !formData.get('file')) {
        ElMessage.warning('请选择要导入的Excel文件');
        return Promise.reject(new Error('导入文件缺失'));
    }

    return request({
        url: '/sys/role/import',    // ✅
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    }).catch(error => handleRequestError(error, '导入角色'));
};