import request from '@/utils/request'

export const getSysAdminPage = (params) => {
    return request({ url: '/api/admin/systemAdmin/list', method: 'GET', params })
}

export const addSysAdmin = (data) => {
    return request({ url: '/api/admin/systemAdmin/add', method: 'POST', data })
}

export const updateSysAdmin = (data) => {
    return request({ url: '/api/admin/systemAdmin/edit', method: 'POST', data })
}

export const updateSysAdminStatus = (id, status) => {
    return request({ url: '/api/admin/systemAdmin/changeStatus', method: 'POST', params: { id, status } })
}

export const resetSysAdminPwd = (id) => {
    return request({ url: '/api/admin/systemAdmin/resetPassword', method: 'POST', params: { id } })
}