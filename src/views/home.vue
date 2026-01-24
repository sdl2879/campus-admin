<template>
  <div class="home-container">
    <h2>首页</h2>
    <el-button type="primary" @click="testApi">测试接口</el-button>
    <div v-if="testResult">{{ testResult }}</div>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'Home',
  data() {
    return {
      testResult: ''
    };
  },
  methods: {
    async testApi() {
      try {
        // 调用需要Token的测试接口
        const res = await request.get('/api/system/test');
        this.testResult = res;
      } catch (error) {
        this.$message.error('接口调用失败！');
        console.error(error);
      }
    }
  }
};
</script>