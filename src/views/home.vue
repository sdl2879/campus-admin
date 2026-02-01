<template>
  <div class="home-container">
    <h1>欢迎进入校园智能活动推荐系统</h1>
  </div>
</template>

<script setup>
// 无逻辑，纯展示
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 20px;
  margin: 0;
}

.home-container h1 {
  font-size: 48px;        /* 超大字号（桌面端）*/
  font-weight: 700;
  color: #10b981;         /* 改用系统主色：活力绿 */
  text-align: center;
  line-height: 1.3;
  margin: 0;
  padding: 0;
  max-width: 100%;
  letter-spacing: 1px;    /* 微调字间距，更舒展 */
}

/* 平板 */
@media (max-width: 768px) {
  .home-container h1 {
    font-size: 36px;
  }
}

/* 手机 */
@media (max-width: 480px) {
  .home-container h1 {
    font-size: 28px;
    padding: 0 15px;      /* 小屏增加左右留白 */
  }
}
</style>