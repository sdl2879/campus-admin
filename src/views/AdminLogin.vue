<!-- src/views/admin/AdminLogin.vue -->
<!-- 管理端登录 -->
<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h2 class="login-title">"校园智能推荐系统"</h2>
        <p class="login-desc">管理端登录</p>
      </div>

      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              clearable
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div class="code-container">
            <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                prefix-icon="el-icon-shield"
                clearable
                class="code-input"
            />
            <div class="code-img" @click="refreshCode">
              {{ verifyCode }}
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              class="login-btn"
              @click="handleLogin"
              :loading="loginLoading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { loginAdmin } from '@/api/login.js'; // 导入登录接口

// 路由实例
const router = useRouter();
// 表单引用
const loginFormRef = ref(null);
// 登录加载状态
const loginLoading = ref(false);
// 验证码
const verifyCode = ref('');

// 登录表单数据
const loginForm = reactive({
  username: 'admin', // 默认用户名
  password: '',
  code: ''
});

// 表单校验规则
const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度在 6-32 个字符之间', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { length: 4, message: '验证码长度为 4 个字符', trigger: 'blur' }
  ]
});

// 生成随机验证码
const generateVerifyCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  verifyCode.value = code;
};

// 刷新验证码
const refreshCode = () => {
  generateVerifyCode();
};

// 登录处理（对接真实接口）
const handleLogin = async () => {
  try {
    // 表单校验
    await loginFormRef.value.validate();
    // 验证码校验
    if (loginForm.code.toUpperCase() !== verifyCode.value) {
      ElMessage.error('验证码错误，请重新输入');
      refreshCode();
      return;
    }

    loginLoading.value = true;

    // 调用登录接口（src/api/login.js）
    const res = await loginAdmin({
      username: loginForm.username,
      password: loginForm.password
    });

    // 接口返回成功（假设 res.data 包含 token 和用户信息）
    if (res.code === 200) {
      localStorage.setItem('adminToken', res.data.token); // 存储 JWT token
      localStorage.setItem('adminInfo', JSON.stringify(res.data.user)); // 存储用户信息
      ElMessage.success('登录成功！');
      // 跳转到默认页面（角色管理）
      router.push('/admin/system/role/list');
    } else {
      ElMessage.error(res.msg || '登录失败');
      refreshCode();
    }
  } catch (error) {
    ElMessage.error('登录异常，请稍后重试');
    console.error('登录失败：', error);
  } finally {
    loginLoading.value = false;
  }
};

// 初始化生成验证码
generateVerifyCode();
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 420px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 25px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 8px;
}

.login-desc {
  font-size: 14px;
  color: #666;
}

.code-container {
  display: flex;
  gap: 10px;
}

.code-input {
  flex: 1;
}

.code-img {
  width: 120px;
  height: 40px;
  background-color: #1989fa;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  letter-spacing: 2px;
  user-select: none;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}
</style>