<template>
  <div class="pwd-container">
    <h3>修改密码</h3>
    <el-form :model="pwdForm" ref="formRef" label-width="120px">
      <el-form-item label="原密码" prop="oldPwd">
        <el-input v-model="pwdForm.oldPwd" type="password" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input v-model="pwdForm.newPwd" type="password" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPwd">
        <el-input v-model="pwdForm.confirmPwd" type="password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitPwd">修改密码</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const formRef = ref(null)
const pwdForm = reactive({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})

// 提交密码修改
const submitPwd = async () => {
  await formRef.value.validate()
  if (pwdForm.newPwd !== pwdForm.confirmPwd) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  const res = await axios.post('/api/user/admin/changePwd', pwdForm)
  if (res.data.code === 200) {
    ElMessage.success('密码修改成功，请重新登录')
    // 修改成功后可跳转至登录页
  } else {
    ElMessage.error('密码修改失败：' + res.data.msg)
  }
}
</script>

<style scoped>
.pwd-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}
</style>