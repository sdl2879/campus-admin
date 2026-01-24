import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('admin_token') || '')
    const userInfo = ref(JSON.parse(localStorage.getItem('admin_userInfo')) || {})

    const login = (newToken, newUserInfo) => {
        token.value = newToken
        userInfo.value = newUserInfo
        localStorage.setItem('admin_token', newToken)
        localStorage.setItem('admin_userInfo', JSON.stringify(newUserInfo))
    }

    const logout = () => {
        token.value = ''
        userInfo.value = {}
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_userInfo')
    }

    return { token, userInfo, login, logout }
})