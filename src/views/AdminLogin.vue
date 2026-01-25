<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h1 class="system-title">校园智能活动推荐系统</h1>
        <p class="system-subtitle">管理端登录</p>
      </div>

      <div class="login-form">
        <div class="input-group">
          <span class="input-icon">👤</span>
          <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="input-item"
          >
        </div>

        <div class="input-group">
          <span class="input-icon">🔒</span>
          <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="input-item"
          >
        </div>

        <div class="captcha-group">
          <div class="input-group captcha-input">
            <span class="input-icon">✅</span>
            <input
                v-model="captcha"
                type="text"
                placeholder="请输入验证码"
                class="input-item"
            >
          </div>
          <div class="captcha-code" @click="refreshCaptcha">
            {{ captchaCode }}
          </div>
        </div>

        <button
            class="login-btn"
            @click="handleLogin"
            :class="{ loading: loading }"
            :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

// 表单数据
const username = ref('admin')
const password = ref('123456')
const captcha = ref('')
const captchaCode = ref('WPGC')

// 刷新验证码
const refreshCaptcha = () => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = code
}

// 登录逻辑（优化版）
const handleLogin = () => {
  // 基础校验
  if (!username.value || !password.value || !captcha.value) {
    ElMessage.warning('请填写完整登录信息')
    return
  }

  // 验证码校验
  if (captcha.value.toUpperCase() !== captchaCode.value.toUpperCase()) {
    ElMessage.error('验证码错误，请重新输入')
    refreshCaptcha()
    return
  }

  loading.value = true
  // 模拟登录接口
  setTimeout(() => {
    // 保存token
    localStorage.setItem('adminToken', 'fake-token-123456')
    localStorage.setItem('adminInfo', JSON.stringify({
      username: username.value,
      name: '系统管理员'
    }))

    // 用Element Plus的提示替代alert
    ElMessage.success({
      message: '登录成功，正在跳转...',
      duration: 1500, // 显示1.5秒后自动关闭
      onClose: () => {
        // 自动跳转到管理端首页
        router.push('/admin/system/role/list')
      }
    })

    loading.value = false
  }, 800)
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
/* 页面容器 */
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  right: -80px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
}

/* 登录卡片 */
.login-card {
  width: 420px;
  padding: 40px 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;
  animation: cardFadeIn 0.6s ease;
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.system-title {
  font-size: 28px;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 6px 0;
}

.system-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 登录表单 */
.login-form {
  margin-top: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 16px;
  height: 48px;
}

.input-icon {
  width: 40px;
  text-align: center;
  font-size: 16px;
  color: #909399;
}

.input-item {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 12px;
  font-size: 14px;
}

/* 验证码组 */
.captcha-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.captcha-input {
  flex: 1;
}

.captcha-code {
  width: 120px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  letter-spacing: 2px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.captcha-code:hover {
  background: #e9ecef;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a4190 100%);
}

.login-btn.loading,
.login-btn:disabled {
  background: linear-gradient(135deg, #8894e0 0%, #8e6aa8 100%);
  cursor: not-allowed;
}
</style>