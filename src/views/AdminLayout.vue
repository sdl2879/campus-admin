<!-- 管理端布局 -->
<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="layout-sidebar">
      <div class="sidebar-logo">
        <h2>校园智能活动推荐系统</h2>
      </div>
      <el-menu
          :default-active="currentRoute"
          class="layout-menu"
          background-color="#0f172a"
          text-color="#fff"
          active-text-color="#1989fa"
          router
          :collapse="isCollapse"
      >
        <!-- 系统管理菜单 -->
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/admin/system/role/list">角色管理</el-menu-item>
          <el-menu-item index="/admin/system/moduleConfig/first">一级模块配置</el-menu-item>
          <el-menu-item index="/admin/system/config/base">基础信息配置</el-menu-item>
          <el-menu-item index="/admin/system/log/operation">操作日志</el-menu-item>
        </el-sub-menu>

        <!-- 用户管理菜单 -->
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

        <!-- 活动管理菜单 -->
        <el-sub-menu index="activity">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>活动管理</span>
          </template>
          <el-menu-item index="/admin/activity/manage/list">活动列表</el-menu-item>
          <el-menu-item index="/admin/activity/audit/list">活动审核</el-menu-item>
          <el-menu-item index="/admin/activity/data/stat">活动统计</el-menu-item>
        </el-sub-menu>

        <!-- 其他菜单（智能推荐/数据统计/消息通知等） -->
        <el-sub-menu index="recommend">
          <template #title>
            <el-icon><MagicStick /></el-icon>
            <span>智能推荐管理</span>
          </template>
          <el-menu-item index="/admin/recommend/algorithm/contentBased">基于内容推荐配置</el-menu-item>
          <el-menu-item index="/admin/recommend/rule/interest">兴趣规则配置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <div class="layout-main">
      <!-- 顶部栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
              :icon="Menu"
              class="collapse-btn"
              @click="toggleCollapse"
          />
        </div>
        <div class="header-right">
          <el-dropdown @command="handleDropdownCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ adminName }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="changePwd">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域（路由出口） -->
      <el-main class="layout-content">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { logoutAdmin } from '@/api/login.js';
// 图标
import {
  Setting,
  User,
  UserFilled,
  Menu,
  TrendCharts,
  MagicStick
} from '@element-plus/icons-vue';

const router = useRouter();

const isCollapse = ref(false);
const sidebarWidth = computed(() => (isCollapse.value ? '64px' : '220px'));
const adminName = ref('');
const currentRoute = computed(() => router.currentRoute.value.path);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const initAdminInfo = () => {
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
  if (adminInfo) adminName.value = adminInfo.username || '管理员';
};

const handleDropdownCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile');
      break;
    case 'changePwd':
      router.push('/admin/changePwd');
      break;
    case 'logout':
      try {
        await logoutAdmin();
      } catch (e) {
        console.error('退出登录接口异常：', e);
      } finally {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        ElMessage.success('退出登录成功！');
        router.push('/admin/login');
      }
      break;
  }
};

onMounted(() => initAdminInfo());
</script>

<style scoped>
/* 样式与你原文件完全一致，未改动 */
.layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.layout-sidebar {
  background-color: #0f172a;
  color: #fff;
  overflow-y: auto;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-bottom: 1px solid #1e293b;
}
.sidebar-logo h2 {
  font-size: 16px;
  font-weight: 600;
}
.layout-menu {
  border-right: none;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  height: 60px;
}
.collapse-btn {
  background: transparent;
  color: #666;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
}
.layout-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9fafb;
}
</style>