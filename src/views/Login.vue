<template>
  <div class="login-container">
    <div class="bg-decoration"></div>
    <div class="login-card">
      <div class="login-header">
        <div class="logo-box">
          <span class="logo-icon">🎓</span>
        </div>
        <h1 class="system-title">校园智能活动推荐系统</h1>
        <p class="login-subtitle">管理端后台</p>
      </div>
      <el-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          label-width="0"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入管理员账号/工号"
              size="large"
              prefix-icon="User"
              autocomplete="off"
              class="form-input"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入登录密码"
              size="large"
              prefix-icon="Lock"
              autocomplete="off"
              class="form-input"
              @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item class="login-btn-wrap">
          <el-button
              type="primary"
              size="large"
              class="login-btn"
              @click="handleLogin"
              :loading="isLoading"
          >
            登录管理端
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span>© 2026 校园智能活动推荐平台 版权所有</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
// 导入真实登录接口
import { loginAdmin } from '@/api/login'

const router = useRouter()
const formRef = ref(null)
const isLoading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})
const loginRules = reactive({
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, message: '密码不少于6位', trigger: 'blur' }
  ]
})

// 【核心修改】适配接口封装的登录逻辑
const handleLogin = async () => {
  // 1. 表单校验
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善登录信息')
    return
  }

  isLoading.value = true
  try {
    // 2. 调用管理员登录接口（res 是响应拦截器处理后的 {code, msg, data}）
    const res = await loginAdmin(loginForm)
    // 3. 正确解析后端返回的有效数据（adminToken/admin）
    const responseData = res.data || {}

    // 4. 校验Token是否存在（使用后端真实字段名 adminToken）
    if (!responseData || !responseData.adminToken) {
      throw new Error('登录成功但未获取到认证Token')
    }

    // 5. 存储登录态（与后端字段匹配）
    localStorage.setItem('token', responseData.adminToken)
    localStorage.setItem('adminInfo', JSON.stringify(responseData.admin || {}))
    localStorage.setItem('adminRole', responseData.admin?.role || 'admin')

    // 6. 登录成功提示 + 跳转【✅ 已修正路径】
    ElMessage.success('登录成功，欢迎进入管理端！')
    router.push('/system/role/list').catch(err => {
      console.warn('跳转失败，兜底到角色列表页', err)
      router.push('/system/role/list') // 兜底也用正确路径
    })
  } catch (error) {
    // 7. 精准错误提示
    let errorMsg = '登录失败，请检查账号密码'
    if (error.message) {
      errorMsg = error.message
    }
    ElMessage.error(errorMsg)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #e6fffa 50%, #f5fafe 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 20px 0;
}
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
      radial-gradient(circle at 15% 25%, rgba(52, 211, 153, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 85% 75%, rgba(34, 211, 238, 0.06) 0%, transparent 40%),
      radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 35%);
  z-index: 0;
}
.login-card {
  width: 420px;
  padding: 48px 40px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.07);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.8);
}
.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.logo-box {
  width: 80px;
  height: 80px;
  background: linear-gradient(120deg, #34d399 0%, #22d3ee 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.2);
}
.logo-icon {
  font-size: 36px;
  color: #ffffff;
}
.system-title {
  font-size: 24px;
  color: #1f2937;
  margin: 0 0 8px 0;
  font-weight: 600;
  letter-spacing: 0.6px;
}
.login-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}
.login-form {
  margin-bottom: 24px;
}
.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}
.form-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 0 18px;
  height: 50px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  box-shadow: none;
  transition: all 0.2s ease;
}
.form-input :deep(.el-input__wrapper):focus-within {
  border-color: #34d399;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}
.form-input :deep(.el-input__prefix) {
  color: #6b7280;
  font-size: 18px;
}
.login-btn-wrap {
  margin-bottom: 0;
}
.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(120deg, #34d399 0%, #22d3ee 100%);
  border: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.8px;
  transition: all 0.2s ease;
}
.login-btn:hover {
  background: linear-gradient(120deg, #10b981 0%, #06b6d4 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.2);
}
.login-btn:active {
  transform: translateY(1px);
}
.login-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.login-footer span {
  font-size: 12px;
  color: #9ca3af;
}
@media (max-width: 480px) {
  .login-card {
    width: 92%;
    padding: 36px 24px;
  }
  .system-title {
    font-size: 20px;
  }
  .logo-box {
    width: 70px;
    height: 70px;
  }
  .logo-icon {
    font-size: 30px;
  }
}
</style>