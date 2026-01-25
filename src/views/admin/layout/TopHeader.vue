<template>
  <div class="top-header">
    <!-- 用户信息下拉菜单 -->
    <el-dropdown @command="handleCommand" trigger="click">
      <div class="user-info">
        <el-avatar :src="userInfo.avatar || defaultAvatar" class="user-avatar"></el-avatar>
        <span class="user-name">{{ userInfo.name || '系统管理员' }}</span>
        <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-dropdown-item>
          <el-dropdown-item command="changePwd">
            <el-icon><Lock /></el-icon>
            <span>修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 个人资料弹窗 -->
    <el-dialog v-model="profileDialogVisible" title="个人资料" width="500px">
      <el-form :model="profileForm" label-width="80px" ref="profileFormRef">
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="profileForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              action="/api/admin/upload/avatar"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
          >
            <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="pwdDialogVisible" title="修改密码" width="400px">
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="80px">
        <el-form-item label="旧密码" prop="oldPwd">
          <el-input v-model="pwdForm.oldPwd" type="password" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input v-model="pwdForm.newPwd" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPwd">
          <el-input v-model="pwdForm.confirmPwd" type="password" placeholder="请确认新密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePwd">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入图标
import { ArrowDown, User, Lock, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 用户信息（从本地缓存获取）
const userInfo = ref({
  id: '',
  username: '',
  name: '',
  phone: '',
  email: '',
  avatar: ''
})

// 弹窗控制
const profileDialogVisible = ref(false)
const pwdDialogVisible = ref(false)

// 表单引用
const profileFormRef = ref(null)
const pwdFormRef = ref(null)

// 个人资料表单
const profileForm = reactive({
  username: '',
  name: '',
  phone: '',
  email: '',
  avatar: ''
})

// 密码修改表单
const pwdForm = reactive({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})

// 密码校验规则
const pwdRules = reactive({
  oldPwd: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPwd: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.newPwd) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 初始化用户信息
const initUserInfo = () => {
  try {
    const info = localStorage.getItem('adminInfo')
    if (info) {
      userInfo.value = JSON.parse(info)
      // 赋值到表单
      profileForm.username = userInfo.value.username
      profileForm.name = userInfo.value.name
      profileForm.phone = userInfo.value.phone
      profileForm.email = userInfo.value.email
      profileForm.avatar = userInfo.value.avatar
    }
  } catch (e) {
    console.error('获取用户信息失败：', e)
  }
}

// 下拉菜单命令处理
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      profileDialogVisible.value = true
      break
    case 'changePwd':
      pwdDialogVisible.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    // 清除本地缓存
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    // 跳转登录页
    router.push('/admin/login')
    ElMessage.success('退出登录成功！')
  }).catch(() => {
    ElMessage.info('已取消退出')
  })
}

// 头像上传成功
const handleAvatarSuccess = (res) => {
  if (res.code === 200) {
    profileForm.avatar = res.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败')
  }
}

// 头像上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片格式文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过2MB！')
    return false
  }
  return true
}

// 保存个人资料
const saveProfile = () => {
  // 模拟接口请求
  setTimeout(() => {
    // 更新本地缓存
    userInfo.value.name = profileForm.name
    userInfo.value.phone = profileForm.phone
    userInfo.value.email = profileForm.email
    userInfo.value.avatar = profileForm.avatar
    localStorage.setItem('adminInfo', JSON.stringify(userInfo.value))

    profileDialogVisible.value = false
    ElMessage.success('个人资料修改成功！')
  }, 500)
}

// 保存密码
const savePwd = () => {
  pwdFormRef.value.validate((valid) => {
    if (!valid) return

    // 模拟接口请求
    setTimeout(() => {
      pwdDialogVisible.value = false
      // 重置密码表单
      pwdForm.oldPwd = ''
      pwdForm.newPwd = ''
      pwdForm.confirmPwd = ''
      ElMessage.success('密码修改成功，请重新登录！')
      // 退出登录
      handleLogout()
    }, 500)
  })
}

// 初始化
onMounted(() => {
  initUserInfo()
})
</script>

<style scoped>
.top-header {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  color: #333;
}

.user-avatar {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.user-name {
  margin-right: 4px;
}

.dropdown-icon {
  font-size: 12px;
}

/* 头像上传样式 */
.avatar-uploader {
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>