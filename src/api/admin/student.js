// src/api/admin/student.js
import request from '@/utils/request'

/**
 * 分页查询学生列表（支持多条件筛选）
 * @param {Object} data - 查询参数，包含 StudentQueryDTO 字段
 *   - studentNo: 学号（模糊）
 *   - name: 姓名（模糊）
 *   - deptId / majorId: 院系/专业ID
 *   - grade / className: 年级/班级
 *   - status: 账号状态
 *   - minScore / maxScore: 分值范围
 *   - pageNum / pageSize: 分页参数
 * @returns {Promise} 分页数据
 */
export function getStudentPage(data) {
    return request({
        url: '/admin/student/page',
        method: 'post',
        data
    })
}

/**
 * 新增学生
 * @param {Object} data - StudentAddDTO 对象
 *   - studentNo, name, gender, deptId, deptName, majorId, majorName,
 *     grade, className, phone, email, avatar, interestTags, password
 * @returns {Promise}
 */
export function addStudent(data) {
    return request({
        url: '/admin/student/add',
        method: 'post',
        data
    })
}

/**
 * 启用/禁用学生账号
 * @param {number} id - 学生ID
 * @param {number} status - 状态：1=启用，0=禁用
 * @returns {Promise}
 */
export function updateStudentStatus(id, status) {
    return request({
        url: '/admin/student/updateStatus',
        method: 'post',
        params: { id, status } // 使用 query 参数传递
    })
}

/**
 * 重置学生密码为默认值（如 123456）
 * @param {number} id - 学生ID
 * @returns {Promise}
 */
export function resetStudentPwd(id) {
    return request({
        url: '/admin/student/resetPassword',
        method: 'post',
        params: { id }
    })
}

/**
 * 导出符合条件的学生列表（Excel）
 * @param {Object} data - 与 getStudentPage 相同的查询条件
 * @returns {Promise<Blob>} Excel 文件流
 */
export function exportStudentList(data) {
    return request({
        url: '/admin/student/export',
        method: 'post',
        data,
        responseType: 'blob' // 重要：指定返回二进制流
    })
}

/**
 * 获取学生详情（用于查看或编辑回显）
 * @param {number} id - 学生ID
 * @returns {Promise<Student>} 学生完整信息
 */
export function getStudentById(id) {
    return request({
        url: `/admin/student/${id}`,
        method: 'get'
    })
}

/**
 * 更新学生基本信息（不含密码）
 * @param {Object} data - StudentUpdateDTO 对象
 *   - id（必填）, name, gender, deptId, deptName, majorId, majorName,
 *     grade, className, phone, email, avatar, interestTags, status
 * @returns {Promise}
 */
export function updateStudent(data) {
    return request({
        url: '/admin/student/update',
        method: 'post',
        data
    })
}