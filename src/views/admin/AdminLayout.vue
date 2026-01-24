<template>
  <el-container style="height: 100vh;">
    <!-- 侧边栏 -->
    <el-aside width="220px" style="background: #1f2d3d;">
      <div class="admin-logo" style="color: #fff; text-align: center; line-height: 60px; font-size: 16px; border-bottom: 1px solid #2f3d4e;">
        校园活动智能系统
      </div>
      <el-menu
          default-active="1-1"
          class="el-menu-vertical-demo"
          background-color="#1f2d3d"
          text-color="#fff"
          active-text-color="#409EFF"
          @select="handleMenuSelect"
          :collapse-transition="false"
      >
        <!-- 1. 系统管理 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="1-1">角色权限管理</el-menu-item>
          <el-menu-item index="1-2">用户管理</el-menu-item>
          <el-menu-item index="1-3">系统配置</el-menu-item>
          <el-menu-item index="1-4">日志管理</el-menu-item>
        </el-sub-menu>

        <!-- 2. 活动管理 -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>活动管理</span>
          </template>
          <el-menu-item index="2-1">活动全生命周期</el-menu-item>
          <el-menu-item index="2-2">活动审核管理</el-menu-item>
          <el-menu-item index="2-3">活动数据管理</el-menu-item>
        </el-sub-menu>

        <!-- 3. 智能推荐管理 -->
        <el-sub-menu index="3">
          <template #title>
            <el-icon><MagicStick /></el-icon>
            <span>智能推荐管理</span>
          </template>
          <el-menu-item index="3-1">推荐算法配置</el-menu-item>
          <el-menu-item index="3-2">推荐规则管理</el-menu-item>
          <el-menu-item index="3-3">推荐效果分析</el-menu-item>
        </el-sub-menu>

        <!-- 4. 数据统计分析 -->
        <el-sub-menu index="4">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>数据统计分析</span>
          </template>
          <el-menu-item index="4-1">活动统计</el-menu-item>
          <el-menu-item index="4-2">用户统计</el-menu-item>
          <el-menu-item index="4-3">系统性能统计</el-menu-item>
        </el-sub-menu>

        <!-- 5. 消息与通知管理 -->
        <el-sub-menu index="5">
          <template #title>
            <el-icon><Message /></el-icon>
            <span>消息与通知管理</span>
          </template>
          <el-menu-item index="5-1">消息推送</el-menu-item>
          <el-menu-item index="5-2">模板管理</el-menu-item>
        </el-sub-menu>

        <!-- 6. 院系管理：全版本兼容图标 -->
        <el-sub-menu index="6">
          <template #title>
            <el-icon><User /></el-icon>
            <span>院系管理</span>
          </template>
          <el-menu-item index="6-1">院系信息管理</el-menu-item>
          <el-menu-item index="6-2">院系数据管理</el-menu-item>
        </el-sub-menu>

        <!-- 7. 小程序配置管理：全版本兼容图标 -->
        <el-menu-item index="7">
          <el-icon><Tools /></el-icon>
          <template #title>小程序配置管理</template>
        </el-menu-item>

        <!-- 退出登录：全版本兼容图标 -->
        <el-menu-item index="8" @click="handleLogout" style="margin-top: 20px;">
          <el-icon><SwitchButton /></el-icon>
          <template #title>退出登录</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header style="text-align: right; font-size: 12px; background: #fff; border-bottom: 1px solid #e6e6e6;">
        <el-dropdown>
          <div style="display: inline-flex; align-items: center; cursor: pointer;">
            <img src="https://via.placeholder.com/30/409EFF/fff?text=AD" class="avatar" style="border-radius: 50%; margin-right: 5px;" />
            <span>超级管理员</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item>修改密码</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main style="padding: 20px; background: #f5f7fa;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 1. 导入所有用到的图标（解决图标缺失报错）
import {
  Setting, Menu, MagicStick, DataAnalysis, Message,
  User, Tools, SwitchButton
} from '@element-plus/icons-vue'

// 2. 临时注释 Pinia 相关代码（适配极简路由，避免依赖缺失报错）
// import { useUserStore } from '@/stores/user'

const router = useRouter()
// const userStore = useUserStore()

// 菜单点击映射（仅保留核心的角色/用户管理，其他路径可后续补充）
const handleMenuSelect = (index) => {
  const pathMap = {
    '1-1': '/admin/system/role',    // 角色权限管理
    '1-2': '/admin/system/user',    // 用户管理
    // 其他路径可先注释，避免跳转不存在的页面
    // '1-3': '/admin/system/config',
    // '1-4': '/admin/system/log',
    // '2-1': '/admin/activity/lifecycle',
    // '2-2': '/admin/activity/audit',
    // '2-3': '/admin/activity/data',
    // '3-1': '/admin/recommend/algorithm',
    // '3-2': '/admin/recommend/rule',
    // '3-3': '/admin/recommend/analysis',
    // '4-1': '/admin/analysis/activity',
    // '4-2': '/admin/analysis/user',
    // '4-3': '/admin/analysis/system',
    // '5-1': '/admin/message/push',
    // '5-2': '/admin/message/template',
    // '6-1': '/admin/dept/info',
    // '6-2': '/admin/dept/data',
    // '7': '/admin/mini/config'
  }
  if (pathMap[index]) {
    router.push(pathMap[index])
  } else {
    // 未配置的菜单提示（避免无响应）
    ElMessage.info('该功能模块暂未开发，敬请期待')
  }
}

// 退出登录逻辑（简化版，移除 Pinia 依赖）
const handleLogout = () => {
  // 临时移除 Pinia 逻辑，仅保留基础跳转
  // userStore.logout()
  ElMessage.success('退出成功，欢迎再次登录')
  router.push('/admin/login')
}
</script>

<style scoped>
.el-header {
  line-height: 60px;
}
.avatar {
  width: 30px;
  height: 30px;
}
:deep(.el-menu-vertical-demo) {
  border-right: none;
}
:deep(.el-sub-menu__title) {
  color: #fff !important;
}
</style>