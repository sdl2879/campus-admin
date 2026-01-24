import { createRouter, createWebHistory } from 'vue-router'

// 核心页面导入
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import UserManage from '@/views/admin/system/UserManage.vue'
import RolePermission from '@/views/admin/system/RolePermission.vue'

// 极简路由配置：仅保留核心的角色/用户管理
const routes = [
    // 根路径重定向到登录页
    { path: '/', redirect: '/admin/login' },

    // 管理端登录
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: AdminLogin
    },

    // 管理端主布局
    {
        path: '/admin',
        name: 'AdminLayout',
        component: AdminLayout,
        children: [
            // 默认显示角色权限管理（可选，也可保留用户管理）
            {
                path: '',
                name: 'AdminHome',
                component: RolePermission
            },
            // 角色权限管理（独立路由）
            { path: 'system/role', name: 'RolePermission', component: RolePermission },
            // 用户管理（独立路由）
            { path: 'system/user', name: 'UserManage', component: UserManage }
        ]
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// 临时注释登录守卫（保证先运行）
// router.beforeEach((to, from, next) => {
//   const isLogin = localStorage.getItem('admin_token')
//   if (to.path.startsWith('/admin/') && !isLogin && to.path !== '/admin/login') {
//     next('/admin/login')
//   } else {
//     next()
//   }
// })

export default router