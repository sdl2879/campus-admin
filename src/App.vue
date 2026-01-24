<template>
  <!-- 路由出口：所有匹配的路由组件都会渲染到这里 -->
  <router-view />
</template>

<script setup>
// 空默认的HelloWorld组件引入，无需任何额外代码
// 路由相关逻辑已在 router/index.js 中配置，这里仅需提供挂载点
</script>

<style>
/* 全局重置样式：解决页面布局塌陷、边距混乱问题 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 确保页面容器占满视口，适配 AdminLayout 的 100vh 布局 */
html, body, #app {
  height: 100%;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 重置 Element Plus 组件可能的默认样式冲突 */
:root {
  --el-color-primary: #409EFF;
}
</style>