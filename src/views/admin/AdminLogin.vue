<!-- src/views/admin/AdminLogin.vue -->
<template>
  <div class="admin-login-page">
    <div class="login-card">
      <!-- 左侧图标区 -->
      <div class="login-left">
        <div class="system-icon">
          <svg width="120" height="100" viewBox="0 0 120 100">
            <rect x="10" y="5" width="100" height="70" rx="5" fill="#409EFF" />
            <rect x="15" y="10" width="90" height="60" rx="3" fill="#fff" />
            <rect x="20" y="20" width="70" height="8" fill="#409EFF" rx="2" />
            <rect x="20" y="35" width="50" height="8" fill="#409EFF" rx="2" />
            <rect x="20" y="50" width="80" height="8" fill="#409EFF" rx="2" />
            <rect x="30" y="75" width="60" height="8" fill="#409EFF" rx="4" />
          </svg>
        </div>
        <div class="system-name" style="color: #fff; font-size: 18px; margin-top: 20px;">
          校园活动智能推荐系统
        </div>
      </div>
      <!-- 右侧登录表单 -->
      <div class="login-right">
        <h2 class="login-title">管理端登录</h2>
        <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="0"
            class="login-form"
        >
          <el-form-item prop="username">
            <el-input
                v-model="loginForm.username"
                placeholder="用户名"
                class="input-item"
                clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                class="input-item"
                clearable
                show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
                type="primary"
                @click="handleLogin"
                class="login-btn"
                :loading="loginLoading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginLoading = ref(false)
const loginFormRef = ref(null)

const loginForm = ref({
  username: 'admin',
  password: '123456'
})

const loginRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
  } catch (error) {
    ElMessage.error('请完善登录信息')
    return
  }

  loginLoading.value = true

  try {
    // 模拟接口返回
    const res = {
      data: {
        token: 'mock_admin_token_123456',
        userInfo: { id: 1, username: 'admin', role: 'super_admin' }
      }
    }

    const { token, userInfo } = res.data
    userStore.login(token, userInfo)
    ElMessage.success('登录成功！欢迎使用校园活动智能推荐系统')
    router.push('/admin/system/user')
  } catch (error) {
    ElMessage.error(error.msg || '登录失败，请检查账号密码')
    console.error('登录异常:', error)
  } finally {
    loginLoading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8f4f8 0%, #d0e9f2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  width: 720px;
  height: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  display: flex;
  overflow: hidden;
}
.login-left {
  width: 40%;
  background: #409EFF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.system-icon {
  color: #fff;
}
.login-right {
  width: 60%;
  padding: 50px 40px;
}
.login-title {
  font-size: 22px;
  color: #1f2d3d;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
}
.login-form {
  width: 100%;
}
.input-item {
  margin-bottom: 20px;
}
.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}
</style>