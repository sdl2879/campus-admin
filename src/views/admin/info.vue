<template>
  <div class="info-container">
    <h3>个人信息</h3>
    <el-form :model="adminForm" ref="formRef" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="adminForm.username" disabled />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="adminForm.realName" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="adminForm.phone" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="adminForm.email" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const formRef = ref(null)
const adminForm = reactive({
  id: '',
  username: '',
  realName: '',
  phone: '',
  email: ''
})

// 加载当前管理员信息
const loadAdminInfo = async () => {
  const res = await axios.get('/api/user/admin/info')
  if (res.data.code === 200) {
    Object.assign(adminForm, res.data.data)
  }
}

// 提交修改
const submitForm = async () => {
  await formRef.value.validate()
  const res = await axios.put('/api/user/admin/info', adminForm)
  if (res.data.code === 200) {
    ElMessage.success('信息修改成功')
  } else {
    ElMessage.error('信息修改失败：' + res.data.msg)
  }
}

onMounted(() => {
  loadAdminInfo()
})
</script>

<style scoped>
.info-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}
</style>