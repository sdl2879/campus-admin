import request from '@/utils/request.js';

/**
 * 获取角色列表（分页 + 搜索）
 * @param {Object} params - 请求参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.roleName] - 角色名称（模糊查询）
 * @param {string} [params.status] - 角色状态（0-禁用，1-启用）
 * @returns {Promise} - 请求Promise
 */
export const getRoleList = (params) => {
    return request({
        url: '/system/role/list',
        method: 'GET',
        params
    });
};

/**
 * 新增角色
 * @param {Object} data - 角色信息
 * @param {string} data.roleName - 角色名称
 * @param {string} data.roleCode - 角色标识
 * @param {string} [data.roleDesc] - 角色描述
 * @param {string} data.status - 角色状态（0-禁用，1-启用）
 * @returns {Promise} - 请求Promise
 */
export const addRole = (data) => {
    return request({
        url: '/system/role/add',
        method: 'POST',
        data
    });
};

/**
 * 编辑角色
 * @param {Object} data - 角色信息
 * @param {string} data.id - 角色ID
 * @param {string} data.roleName - 角色名称
 * @param {string} [data.roleDesc] - 角色描述
 * @param {string} data.status - 角色状态（0-禁用，1-启用）
 * @returns {Promise} - 请求Promise
 */
export const editRole = (data) => {
    return request({
        url: '/system/role/edit',
        method: 'POST',
        data
    });
};

/**
 * 更新角色状态（启用/禁用）
 * @param {Object} data - 状态信息
 * @param {string} data.id - 角色ID
 * @param {string} data.status - 角色状态（0-禁用，1-启用）
 * @returns {Promise} - 请求Promise
 */
export const updateRoleStatus = (data) => {
    return request({
        url: '/system/role/updateStatus',
        method: 'POST',
        data
    });
};

/**
 * 获取角色权限配置
 * @param {Object} params - 请求参数
 * @param {string} params.roleId - 角色ID
 * @returns {Promise} - 请求Promise
 */
export const getRolePermission = (params) => {
    return request({
        url: '/system/role/getPermission',
        method: 'GET',
        params
    });
};

/**
 * 保存角色权限配置
 * @param {Object} data - 权限配置信息
 * @param {string} data.roleId - 角色ID
 * @param {string[]} data.checkedMenuIds - 已选菜单ID集合
 * @param {Object} data.checkedOperationIds - 已选操作ID集合（key：菜单ID，value：操作ID数组）
 * @param {string} data.dataScope - 数据范围（全部数据/自定义数据/本人数据/角色数据）
 * @param {string[]} [data.checkedDeptIds] - 已选部门ID集合（自定义数据时必填）
 * @returns {Promise} - 请求Promise
 */
export const saveRolePermission = (data) => {
    return request({
        url: '/system/role/savePermission',
        method: 'POST',
        data
    });
};

/**
 * 获取角色修改日志
 * @param {Object} params - 请求参数
 * @param {string} params.roleId - 角色ID
 * @param {string} [params.operator] - 操作员
 * @param {string} [params.operationType] - 操作类型
 * @param {string} [params.startTime] - 开始时间
 * @param {string} [params.endTime] - 结束时间
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} - 请求Promise
 */
export const getRoleLog = (params) => {
    return request({
        url: '/system/role/log/list',
        method: 'GET',
        params
    });
};

/**
 * 导出角色修改日志
 * @param {Object} params - 请求参数（与getRoleLog一致，无分页）
 * @returns {Promise} - 请求Promise（二进制流响应）
 */
export const exportRoleLog = (params) => {
    return request({
        url: '/system/role/log/export',
        method: 'GET',
        params,
        responseType: 'blob' // 二进制流响应
    });
};