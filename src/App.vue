<template>
  <!-- 路由挂载核心节点：所有路由页面（登录页/管理布局页）都会渲染到这里 -->
  <router-view />
</template>

<script setup>
// 清空默认的 HelloWorld 组件导入，无需任何额外代码
// 路由相关逻辑已在 router/index.js 中配置，这里仅需提供挂载点
</script>

<style>
/* 全局基础样式：解决页面布局塌陷、边距异常问题 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 确保页面根容器占满屏幕，适配 AdminLayout 的 100vh 布局 */
html, body, #app {
  height: 100%;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 消除 Element Plus 组件可能的默认样式冲突 */
:root {
  --el-color-primary: #409EFF;
}
</style>