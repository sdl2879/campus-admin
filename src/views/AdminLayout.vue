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
          <el-menu-item index="/admin/system/role/list">角色管理</el-menu-item>
          <el-menu-item index="/admin/system/config/base">基础信息配置</el-menu-item>
          <el-menu-item index="/admin/system/log/operation">操作日志</el-menu-item>
        </el-sub-menu>

        <!-- 用户管理 -->
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/user/systemAdmin/list">系统管理员</el-menu-item>
          <el-menu-item index="/admin/user/deptAdmin/list">院系管理员</el-menu-item>
          <el-menu-item index="/admin/user/activityHost/list">活动负责人</el-menu-item>
          <el-menu-item index="/admin/user/student/list">学生管理</el-menu-item>
        </el-sub-menu>

        <!-- 活动管理 -->
        <el-sub-menu index="activity">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>活动管理</span>
          </template>
          <el-menu-item index="/admin/activity/manage/list">活动列表</el-menu-item>
          <el-menu-item index="/admin/activity/audit/list">活动审核</el-menu-item>
          <el-menu-item index="/admin/activity/data/stat">活动统计</el-menu-item>
        </el-sub-menu>

        <!-- 智能推荐管理 -->
        <el-sub-menu index="recommend">
          <template #title>
            <el-icon><MagicStick /></el-icon>
            <span>智能推荐管理</span>
          </template>
          <el-menu-item index="/admin/recommend/algorithm/contentBased">基于内容推荐配置</el-menu-item>
          <el-menu-item index="/admin/recommend/rule/interest">兴趣规则配置</el-menu-item>
        </el-sub-menu>

        <!-- 数据统计分析 -->
        <el-sub-menu index="statistics">
          <template #title>
            <el-icon><PieChart /></el-icon>
            <span>数据统计分析</span>
          </template>
          <el-menu-item index="/admin/statistics/activity">活动统计</el-menu-item>
          <el-menu-item index="/admin/statistics/user">用户统计</el-menu-item>
          <el-menu-item index="/admin/statistics/system">系统性能统计</el-menu-item>
        </el-sub-menu>

        <!-- 消息与通知管理 -->
        <el-sub-menu index="message">
          <template #title>
            <el-icon><Message /></el-icon>
            <span>消息与通知管理</span>
          </template>
          <el-menu-item index="/admin/message/push">消息推送</el-menu-item>
          <el-menu-item index="/admin/message/template">模板管理</el-menu-item>
        </el-sub-menu>

        <!-- 院系管理 -->
        <el-sub-menu index="dept">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>院系管理</span>
          </template>
          <el-menu-item index="/admin/dept/info/manage">院系信息管理</el-menu-item>
          <el-menu-item index="/admin/dept/data/manage">院系数据管理</el-menu-item>
        </el-sub-menu>

        <!-- 小程序配置管理 -->
        <el-menu-item index="/admin/miniConfig">
          <template #title>
            <el-icon><Phone /></el-icon>
            <span>小程序配置管理</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <div class="layout-main">
      <!-- 顶部栏（已移除标题显示） -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
              class="collapse-btn"
              @click="toggleCollapse"
              plain
          >
            <el-icon><MenuIcon /></el-icon>
          </el-button>
          <!-- 已删除：页面标题显示元素 -->
        </div>
        <div class="header-right">
          <TopHeader :adminName="adminName" />
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="layout-content">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup>
// 导入组件和依赖
import TopHeader from '@/views/admin/layout/TopHeader.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 导入所有需要的图标
import {
  Setting,
  User,
  TrendCharts,
  MagicStick,
  PieChart,
  Message,
  OfficeBuilding,
  Phone,
  Menu as MenuIcon
} from '@element-plus/icons-vue'

const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)
// 侧边栏宽度（折叠/展开）
const sidebarWidth = computed(() => (isCollapse.value ? '64px' : '220px'))
// 当前激活的路由
const currentRoute = computed(() => router.currentRoute.value.path)
// 管理员名称
const adminName = ref('系统管理员')

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 初始化管理员信息
const initAdminInfo = () => {
  try {
    const adminInfoStr = localStorage.getItem('adminInfo')
    if (!adminInfoStr) return
    const adminInfo = JSON.parse(adminInfoStr)
    adminName.value = adminInfo.name || adminInfo.username || '系统管理员'
  } catch (e) {
    console.warn('解析管理员信息失败', e)
    ElMessage.warning('管理员信息加载失败')
  }
}

// 监听路由变化，同步菜单激活状态
watch(
    () => router.currentRoute.value.path,
    (newPath) => {
      // 处理嵌套路由的激活状态
      const menuIndex = newPath.split('/').slice(0, 4).join('/') || newPath
    },
    { immediate: true }
)

// 页面挂载时初始化
onMounted(() => {
  initAdminInfo()
})
</script>

<style scoped>
/* 整体布局 */
.layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.layout-sidebar {
  background-color: #0f172a;
  color: #fff;
  transition: width 0.2s ease;
  overflow: hidden;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1e293b;
  padding: 0 10px;
}

.sidebar-logo h2 {
  font-size: 16px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layout-menu {
  border-right: none;
  height: calc(100vh - 60px);
  padding-top: 10px;
}

/* 主内容区样式 */
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
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  color: #1989fa;
  background-color: #f5f7fa;
}

/* TopHeader容器 */
.header-right {
  display: flex;
  align-items: center;
}

/* 内容区域 */
.layout-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f9fafb;
}

/* 折叠时隐藏文字 */
:deep(.el-menu--collapse .el-menu-item__label),
:deep(.el-menu--collapse .el-sub-menu__title span) {
  display: none;
}

/* 菜单图标居中 */
:deep(.el-menu--collapse .el-menu-item .el-icon),
:deep(.el-menu--collapse .el-sub-menu__title .el-icon) {
  margin-right: 0 !important;
  font-size: 18px;
}

/* 菜单激活样式优化 */
:deep(.el-menu-item.is-active) {
  background-color: #1e293b !important;
  color: #1989fa !important;
}

/* 子菜单缩进自适应 */
:deep(.el-sub-menu .el-menu-item) {
  padding-left: calc(20px + 20px) !important;
}

:deep(.el-menu--collapse .el-sub-menu .el-menu-item) {
  padding-left: 20px !important;
}

/* 菜单hover样式 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #1e293b !important;
  color: #94a3b8 !important;
}

/* 子菜单展开指示器颜色 */
:deep(.el-sub-menu__icon-arrow) {
  color: #94a3b8;
}
</style>