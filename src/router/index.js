// 路由配置
import { createRouter, createWebHashHistory } from 'vue-router';
import { ElMessage } from 'element-plus';

// 导入核心组件
import AdminLogin from '@/views/AdminLogin.vue'; // 登录页
import AdminLayout from '@/views/AdminLayout.vue'; // 管理端布局
import NotFound from '@/views/404.vue'; // 404页面

// 路由规则
const routes = [
    {
        path: '/',
        redirect: '/admin/login' // 默认跳转到管理端登录
    },
    // 登录页
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: AdminLogin,
        meta: { title: '管理端登录', requiresAuth: false }
    },
    // 管理端主路由（需登录）
    {
        path: '/admin',
        name: 'AdminLayout',
        component: AdminLayout,
        meta: { title: '管理中心', requiresAuth: true },
        children: [
            // 1. 系统管理模块（对应 pages/system）
            {
                path: 'system/role/list',
                name: 'RoleList',
                component: () => import('@/views/admin/system/role/RoleList.vue'),
                meta: { title: '角色管理' }
            },
            {
                path: 'system/role/permission/:roleId',
                name: 'RolePermission',
                component: () => import('@/views/admin/system/role/RolePermission.vue'),
                meta: { title: '权限分配' }
            },
            {
                path: 'system/role/log/:roleId',
                name: 'RoleLog',
                component: () => import('@/views/admin/system/role/RoleLog.vue'),
                meta: { title: '权限变更日志' }
            },
            {
                path: 'system/config/base',
                name: 'BaseConfig',
                component: () => import('@/views/admin/system/config/BaseConfig.vue'),
                meta: { title: '基础信息配置' }
            },
            {
                path: 'system/log/operation', // 对应访问路径
                name: 'OperationLog',
                component: () => import('@/views/admin/system/log/OperationLog.vue'), // 对应文件路径
                meta: { title: '操作日志' }
            },
            // 系统管理其他子路由（log/OperationLog 等）按相同格式添加

            // 2. 用户管理模块（对应 pages/user）
            {
                path: 'user/systemAdmin/list',
                name: 'SystemAdminList',
                component: () => import('@/views/admin/user/systemAdmin/SystemAdminList.vue'),
                meta: { title: '系统管理员管理' }
            },
            {
                path: 'user/deptAdmin/list',
                name: 'DeptAdminList',
                component: () => import('@/views/admin/user/deptAdmin/DeptAdminList.vue'),
                meta: { title: '院系管理员管理' }
            },
            {
                path: 'user/activityHost/list',
                name: 'HostList',
                component: () => import('@/views/admin/user/activityHost/HostList.vue'),
                meta: { title: '活动负责人管理' }
            },
            {
                path: 'user/student/list',
                name: 'StudentList',
                component: () => import('@/views/admin/user/student/StudentList.vue'),
                meta: { title: '学生管理' }
            },

            // 3. 活动管理模块（对应 pages/activity，已存在部分）
            {
                path: 'activity/manage/list',
                name: 'ActivityList',
                component: () => import('@/views/admin/activity/ActivityList.vue'),
                meta: { title: '活动列表' }
            },
            {
                path: 'activity/audit/list',
                name: 'ActivityAudit',
                component: () => import('@/views/admin/activity/audit/ActivityAudit.vue'),
                meta: { title: '活动审核' }
            },

            // 4. 其他模块（recommend/statistics/message 等）按相同格式添加
        ]
    },
    // 404页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: { title: '页面不存在' }
    }
];

// 创建路由实例
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
});

// 路由守卫：验证登录状态
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 校园智能活动推荐系统` : '校园智能活动推荐系统';

    // 不需要登录的路由直接放行
    if (!to.meta.requiresAuth) {
        next();
        return;
    }

    // 验证 token（从 localStorage 读取，实际项目可结合 Redis 校验）
    const token = localStorage.getItem('adminToken');
    if (token) {
        next();
    } else {
        ElMessage.warning('请先登录管理端');
        next('/admin/login'); // 未登录跳转到登录页
    }
});
export default router