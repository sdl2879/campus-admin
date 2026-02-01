<template>
  <div class="top-header">
    <span class="admin-name">欢迎，{{ adminName }}</span>
    <el-dropdown trigger="click">
      <el-button type="text" class="oper-btn">
        <el-icon><Setting /></el-icon>
        <span>操作</span>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="openPwdDialog">修改密码</el-dropdown-item>
          <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 修改密码弹窗 -->
    <el-dialog
        v-model="pwdDialogVisible"
        title="修改密码"
        width="400px"
        destroy-on-close
    >
      <el-form
          ref="pwdFormRef"
          :model="pwdForm"
          :rules="pwdRules"
          label-width="80px"
      >
        <el-form-item label="原密码" prop="oldPwd">
          <el-input v-model="pwdForm.oldPwd" type="password" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input v-model="pwdForm.newPwd" type="password" placeholder="请输入新密码（不少于6位）" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPwd">
          <el-input v-model="pwdForm.confirmPwd" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePwd" :loading="pwdLoading">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Setting } from '@element-plus/icons-vue'

// 核心修正：匹配实际文件路径 src/api/sys/admin.js
import { changePassword } from '@/api/sys/admin'

const router = useRouter()
const props = defineProps({
  adminName: {
    type: String,
    default: '管理员'
  }
})

// 修改密码弹窗状态
const pwdDialogVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref(null)
const pwdForm = reactive({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})

// 密码校验规则
const pwdRules = reactive({
  oldPwd: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码不少于6位', trigger: 'blur' }
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

// 打开修改密码弹窗
const openPwdDialog = () => {
  pwdFormRef.value?.resetFields()
  pwdDialogVisible.value = true
}

// 对接后端的修改密码逻辑
const handleUpdatePwd = async () => {
  // 前端表单校验
  try {
    await pwdFormRef.value.validate()
  } catch {
    ElMessage.warning('请完善密码信息')
    return
  }

  pwdLoading.value = true
  try {
    // 调用后端接口（参数匹配后端）
    const res = await changePassword({
      oldPwd: pwdForm.oldPwd,
      newPwd: pwdForm.newPwd
    })

    // 适配后端返回格式
    if (res.success) {
      ElMessage.success('密码修改成功，请重新登录')
      pwdDialogVisible.value = false
      handleLogout()
    } else {
      ElMessage.error(res.msg || '修改密码失败')
    }
  } catch (error) {
    const errMsg = error.response?.data?.msg || '修改密码失败：系统异常'
    ElMessage.error(errMsg)
  } finally {
    pwdLoading.value = false
  }
}

// 退出登录逻辑
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    // 清除本地登录态
    localStorage.removeItem('token')
    localStorage.removeItem('adminInfo')
    localStorage.removeItem('adminRole')
    // 跳回登录页
    router.push('/login')
  }).catch(() => {
    // 取消退出
  })
}
</script>

<style scoped>
.top-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-right: 20px;
}
.admin-name {
  color: #333;
  font-size: 14px;
}
.oper-btn {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}
:deep(.el-dropdown-menu) {
  min-width: 120px;
}
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>