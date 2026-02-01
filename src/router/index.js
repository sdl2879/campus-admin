import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    // 根路径重定向到登录页
    {
        path: '/',
        redirect: '/login'
    },

    // 登录页（公开页面）
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    },

    // 后台主布局（所有受保护页面的父级）
    {
        path: '',
        component: () => import('@/views/Layout.vue'),
        meta: { requiresAuth: true }, // 标记需要认证
        children: [
            // ========== 首页（关键新增！）==========
            {
                path: '', // 匹配 / 路径
                name: 'Home',
                component: () => import('@/views/Home.vue'),
                meta: { title: '首页', requiresAuth: true }
            },

            // ========== 系统管理 ==========
            {
                path: 'system/role/list',
                name: 'RoleList',
                component: () => import('@/views/sys/Role/RoleList.vue'),
                meta: { title: '角色管理' }
            },
            {
                path: 'system/config/base',
                name: 'SysConfigBase',
                component: () => import('@/views/sys/config/SysConfig.vue'),
                meta: { title: '系统配置-基础' }
            },
            {
                path: 'system/log/operation',
                name: 'SysLogOperation',
                component: () => import('@/views/sys/log/SysLog.vue'),
                meta: { title: '系统日志-操作' }
            },

            // ========== 用户管理 ==========
            {
                path: 'user/systemAdmin/list',
                name: 'SysAdminList',
                component: () => import('@/views/admin/sysAdmin/SysAdminList.vue'),
                meta: { title: '系统管理员' }
            },
            {
                path: 'user/deptAdmin/list',
                name: 'DeptAdminList',
                component: () => import('@/views/admin/deptAdmin/DeptAdminList.vue'),
                meta: { title: '院系管理员' }
            },
            {
                path: 'user/student/list',
                name: 'StudentList',
                component: () => import('@/views/admin/student/StudentList.vue'),
                meta: { title: '学生管理' }
            },
            {
                path: 'user/activityManager/list',
                name: 'ActivityManagerList',
                component: () => import('@/views/admin/activityManager/ActivityManagerList.vue'),
                meta: { title: '活动管理员' }
            }
        ]
    },

    // 404 兜底路由（必须放在最后）
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/404.vue')
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// 路由守卫：统一拦截未登录访问
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    // 检查目标路由是否需要认证（只要 matched 中任意一级有 requiresAuth 就拦截）
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            next('/login')
        } else {
            next()
        }
    } else {
        // 公开页面（如登录页）
        next()
    }
})

export default router