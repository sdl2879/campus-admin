<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <el-card title="校园活动系统登录" shadow="hover">
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
          class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              class="login-btn"
              @click="handleLogin"
              :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import service from '@/utils/request'

// 路由实例
const router = useRouter()
// 加载状态
const loading = ref(false)
// 表单引用
const loginFormRef = ref(null)
// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})
// 表单校验规则
const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

// 登录方法
const handleLogin = async () => {
  // 表单校验
  try {
    await loginFormRef.value.validate()
  } catch (error) {
    ElMessage.warning('请完善登录信息！')
    return
  }

  // 发起登录请求
  loading.value = true
  try {
    // 调用后端登录接口（路径匹配：/api/system/login）
    const res = await service.post('/system/login', loginForm)
    // 保存Token到本地存储
    localStorage.setItem('token', res.token)
    ElMessage.success('登录成功！')
    // 跳转到首页
    router.push('/home')
  } catch (error) {
    ElMessage.error('登录失败：用户名或密码错误')
    console.error('登录异常：', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 450px;
  margin: 120px auto;
}
.login-form {
  margin-top: 20px;
}
.login-btn {
  width: 100%;
}
</style>