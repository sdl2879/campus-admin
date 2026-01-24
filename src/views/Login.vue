  //登录
  <!-- src/views/Login.vue -->
  <template>
    <div class="login-container">
      <el-card class="login-card">
        <div class="login-title">校园活动智能推荐系统</div>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
          <el-form-item label="账号" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { login } from '@/api/login'

  const router = useRouter()
  const loginFormRef = ref(null)
  // 登录表单
  const loginForm = ref({
    username: '',
    password: ''
  })
  // 表单校验规则
  const loginRules = ref({
    username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  })

  // 登录逻辑
  const handleLogin = () => {
    loginFormRef.value.validate((valid) => {
      if (valid) {
        // 调用登录接口
        login(loginForm.value).then(res => {
          const { token, userInfo } = res.data
          // 存储token和用户信息
          localStorage.setItem('token', token)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          ElMessage.success('登录成功')
          // 跳首页
          router.push('/home/dashboard')
        }).catch(err => {
          ElMessage.error(err.msg || '登录失败')
        })
      }
    })
  }
  </script>

  <style scoped>
  .login-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
  }
  .login-card {
    width: 400px;
    padding: 20px;
  }
  .login-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #165DFF;
  }
  .login-btn {
    width: 100%;
  }
  </style>