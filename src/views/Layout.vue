<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="layout-sidebar">
      <div class="sidebar-logo">
        <h2 v-show="!isCollapse">校园智能活动推荐系统</h2>
      </div>

      <el-menu
          :default-active="currentRoute"
          class="layout-menu"
          background-color="#0f172a"
          text-color="#fff"
          active-text-color="#1989fa"
          :collapse="isCollapse"
          :unique-opened="true"
          router
      >
        <!-- 系统管理 -->
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <!-- 精准匹配你的 sys/Role/RoleList.vue -->
          <el-menu-item index="/system/role/list">角色管理</el-menu-item>
          <el-menu-item index="/system/config/base">基础信息配置</el-menu-item>
          <el-menu-item index="/system/log/operation">操作日志</el-menu-item>
        </el-sub-menu>

        <!-- 用户管理 -->
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/deptAdmin/list">院系管理员</el-menu-item>
          <el-menu-item index="/user/ActivityManager/list">活动负责人</el-menu-item>
          <el-menu-item index="/user/student/list">学生管理</el-menu-item>
        </el-sub-menu>

        <!-- 活动管理 -->
        <el-sub-menu index="activity">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>活动管理</span>
          </template>
          <el-menu-item index="/user/activity/manage/list">活动生命周期管理</el-menu-item>
          <el-menu-item index="/activity/audit/list">活动审核</el-menu-item>
          <el-menu-item index="/activity/data/stat">活动统计</el-menu-item>
        </el-sub-menu>
        <!-- 院系管理 -->
        <el-sub-menu index="dept">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>院系管理</span>
          </template>
          <el-menu-item index="/dept/info/manage">院系信息管理</el-menu-item>
          <el-menu-item index="/dept/data/manage">院系数据管理</el-menu-item>
        </el-sub-menu>

        <!-- 智能推荐管理 -->
        <el-sub-menu index="recommend">
          <template #title>
            <el-icon><Star /></el-icon>
            <span>智能推荐管理</span>
          </template>
          <el-menu-item index="/recommend/algorithm/contentBased">基于内容推荐配置</el-menu-item>
          <el-menu-item index="/recommend/rule/interest">兴趣规则配置</el-menu-item>
        </el-sub-menu>

        <!-- 数据统计分析 -->
        <el-sub-menu index="statistics">
          <template #title>
            <el-icon><PieChart /></el-icon>
            <span>数据统计分析</span>
          </template>
          <el-menu-item index="/statistics/activity">活动统计</el-menu-item>
          <el-menu-item index="/statistics/user">用户统计</el-menu-item>
          <el-menu-item index="/statistics/system">系统性能统计</el-menu-item>
        </el-sub-menu>

        <!-- 消息与通知管理 -->
        <el-sub-menu index="message">
          <template #title>
            <el-icon><Message /></el-icon>
            <span>消息与通知管理</span>
          </template>
          <el-menu-item index="/message/push">消息推送</el-menu-item>
          <el-menu-item index="/message/template">模板管理</el-menu-item>
        </el-sub-menu>

        <!-- 小程序配置管理 -->
        <el-menu-item index="/miniConfig">
          <template #title>
            <el-icon><Phone /></el-icon>
            <span>小程序配置管理</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <div class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
              class="collapse-btn"
              @click="toggleCollapse"
              plain
          >
            <el-icon><MenuIcon /></el-icon>
          </el-button>
        </div>
        <div class="header-right">
          <TopHeader :adminName="adminName" />
        </div>
      </el-header>

      <el-main class="layout-content">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup>
import TopHeader from '@/views/layout/TopHeader.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import {
  Setting,
  User,
  TrendCharts,
  Star,
  PieChart,
  Message,
  OfficeBuilding,
  Phone,
  Menu as MenuIcon
} from '@element-plus/icons-vue'

const router = useRouter()

const isCollapse = ref(false)
const sidebarWidth = computed(() => (isCollapse.value ? '64px' : '220px'))

// 关键修正：直接匹配路由的完整 path
const currentRoute = computed(() => {
  return router.currentRoute.value.path || '/system/role/list'
})

const adminName = ref('系统管理员')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const initAdminInfo = () => {
  try {
    const adminInfoStr = localStorage.getItem('adminInfo')
    if (!adminInfoStr) return
    const adminInfo = JSON.parse(adminInfoStr)
    adminName.value = adminInfo.name || adminInfo.username || '系统管理员'
  } catch (e) {
    console.warn('解析管理员信息失败', e)
  }
}

watch(
    () => router.currentRoute.value.path,
    () => {},
    { immediate: true }
)

onMounted(() => {
  initAdminInfo()
})
</script>

<style scoped>
.layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f0fdf4;
}

.layout-sidebar {
  background-color: #0f172a;
  color: #fff;
  transition: width 0.2s ease;
  overflow: hidden;
  border-right: 1px solid #e5e7eb;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1e293b;
  padding: 0 10px;
  color: #a7f3d0;
}

.sidebar-logo h2 {
  font-size: 16px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #10b981;
}

.layout-menu {
  border-right: none;
  height: calc(100vh - 60px);
  padding-top: 10px;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #10b981;
  font-size: 18px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  color: #059669;
  background-color: rgba(16,185,129,0.06);
}

.header-right {
  display: flex;
  align-items: center;
}

.layout-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f0fdf4;
}

:deep(.el-menu--collapse .el-menu-item__label),
:deep(.el-menu--collapse .el-sub-menu__title span) {
  display: none;
}

:deep(.el-menu--collapse .el-menu-item .el-icon),
:deep(.el-menu--collapse .el-sub-menu__title .el-icon) {
  margin-right: 0 !important;
  font-size: 18px;
}

:deep(.el-menu-item.is-active) {
  background-color: #1e293b !important;
  color: #10b981 !important;
  border-left: 3px solid #10b981;
}

:deep(.el-sub-menu .el-menu-item) {
  padding-left: calc(20px + 20px) !important;
}

:deep(.el-menu--collapse .el-sub-menu .el-menu-item) {
  padding-left: 20px !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #1e293b !important;
  color: #a7f3d0 !important;
}

:deep(.el-sub-menu__icon-arrow) {
  color: #a7f3d0;
}
</style>