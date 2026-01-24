// src/api/login.js（登录相关）
import request from '@/utils/request'

// 用户登录
export function login(data) {
    return request({
        url: '/api/login',
        method: 'post',
        data
    })
}

// 获取用户信息
export function getUserInfo(token) {
    return request({
        url: '/api/getUserInfo',
        method: 'post',
        data: { token }
    })
}

// src/api/recommend.js（活动推荐）
import request from '@/utils/request'

// 智能推荐活动
export function getRecommendActivity(studentId) {
    return request({
        url: '/api/recommend/activity',
        method: 'get',
        params: { studentId }
    })
}

// src/api/warning.js（分数预警）
import request from '@/utils/request'

// 分数预警查询
export function getScoreWarning(studentId) {
    return request({
        url: '/api/warning/score',
        method: 'get',
        params: { studentId }
    })
}