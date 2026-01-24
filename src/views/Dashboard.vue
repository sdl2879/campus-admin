<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- 分数预警模块 -->
    <el-card class="warning-card">
      <template #header>
        <div class="card-header">毕业活动分预警</div>
      </template>
      <div v-if="warningInfo">
        <p>当前活动分：{{ warningInfo.totalScore }}</p>
        <p>毕业要求分：{{ warningInfo.requiredScore }}</p>
        <el-tag :type="warningInfo.isWarning ? 'danger' : 'success'">
          {{ warningInfo.isWarning ? '分数不足，需尽快参与活动' : '分数达标' }}
        </el-tag>
      </div>
    </el-card>

    <!-- 智能推荐活动模块 -->
    <el-card class="recommend-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">为你推荐的活动</div>
      </template>
      <el-table :data="recommendList" border stripe>
        <el-table-column prop="title" label="活动名称" />
        <el-table-column prop="scoreValue" label="活动分值" />
        <el-table-column prop="subjectTarget" label="适用学科" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small">报名</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getScoreWarning } from '@/api/warning'
import { getRecommendActivity } from '@/api/recommend'

// 分数预警信息
const warningInfo = ref(null)
// 推荐活动列表
const recommendList = ref([])

// 初始化数据
onMounted(() => {
  // 获取当前登录学生ID（模拟，实际从userInfo取）
  const studentId = 1
  // 查询分数预警
  getScoreWarning(studentId).then(res => {
    warningInfo.value = res.data
  })
  // 查询推荐活动
  getRecommendActivity(studentId).then(res => {
    recommendList.value = res.data
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.card-header {
  font-weight: bold;
}
.warning-card {
  width: 100%;
}
.recommend-card {
  width: 100%;
}
</style>