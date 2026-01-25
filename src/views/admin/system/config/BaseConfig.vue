<template>
  <div class="base-config-container">
    <!-- 1. 页面标题栏（统一风格） -->
    <div class="page-header">
      <h3>基础信息配置</h3>
      <el-button type="primary" class="save-btn" @click="submitConfig">保存配置</el-button>
    </div>

    <!-- 2. 配置表单区域（移除客服相关项） -->
    <div class="config-form-container">
      <el-form
          :model="configForm"
          :rules="configRules"
          ref="configFormRef"
          label-width="150px"
          class="config-form"
      >
        <!-- 系统基础信息 -->
        <el-form-item label="系统名称" prop="systemName">
          <el-input
              v-model="configForm.systemName"
              placeholder="请输入系统名称（如：校园智能活动推荐系统）"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="系统版本" prop="systemVersion">
          <el-input
              v-model="configForm.systemVersion"
              placeholder="请输入系统版本（如：v1.0.0）"
              maxlength="20"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="系统域名" prop="systemDomain">
          <el-input
              v-model="configForm.systemDomain"
              placeholder="请输入系统访问域名（如：https://activity.example.com）"
              maxlength="100"
              show-word-limit
          />
        </el-form-item>

        <!-- 移除客服电话/邮箱配置项 -->

        <!-- 其他配置 -->
        <el-form-item label="数据备份周期" prop="backupCycle">
          <el-select v-model="configForm.backupCycle" placeholder="请选择数据备份周期">
            <el-option label="每日备份" value="day" />
            <el-option label="每周备份" value="week" />
            <el-option label="每月备份" value="month" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否开启日志" prop="enableLog">
          <el-radio-group v-model="configForm.enableLog">
            <el-radio label="1">开启</el-radio>
            <el-radio label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="系统描述" prop="systemDesc">
          <el-input
              v-model="configForm.systemDesc"
              placeholder="请输入系统描述信息"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
/********************************************************************
 * 文件名：BaseConfig.vue
 * 存放路径：src/views/admin/system/config/BaseConfig.vue
 * 功能描述：系统基础信息配置页面，管理系统名称、版本、域名等基础参数
 * 依赖说明：
 *  1. element-plus：UI组件库（表单、按钮、输入框等）
 *  2. vue：核心框架（响应式、表单校验等）
 ********************************************************************/
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const loading = ref(false) // 提交加载状态
const configFormRef = ref(null) // 表单引用

// 配置表单数据（移除客服相关字段）
const configForm = reactive({
  systemName: '校园智能活动推荐系统', // 默认系统名称
  systemVersion: 'v1.0.0', // 默认版本
  systemDomain: '', // 系统域名
  backupCycle: 'week', // 默认每周备份
  enableLog: '1', // 默认开启日志
  systemDesc: '基于智能推荐算法的校园活动管理系统，支持活动发布、审核、推荐等功能' // 默认描述
})

// 表单校验规则（移除客服相关校验）
const configRules = reactive({
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '系统名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  systemVersion: [
    { required: true, message: '请输入系统版本', trigger: 'blur' },
    { pattern: /^v\d+\.\d+\.\d+$/, message: '版本格式为 v+数字.数字.数字（如：v1.0.0）', trigger: 'blur' }
  ],
  systemDomain: [
    { pattern: /^https?:\/\/.+$/, message: '请输入合法的域名（以http/https开头）', trigger: 'blur' }
  ],
  backupCycle: [
    { required: true, message: '请选择数据备份周期', trigger: 'change' }
  ],
  enableLog: [
    { required: true, message: '请选择是否开启日志', trigger: 'change' }
  ]
})

// 获取已有配置（模拟接口请求）
const getConfig = () => {
  loading.value = true
  // 实际项目替换为真实接口请求
  setTimeout(() => {
    // 模拟从后端获取配置数据
    loading.value = false
  }, 500)
}

// 提交配置保存
const submitConfig = () => {
  configFormRef.value.validate((valid) => {
    if (!valid) return

    loading.value = true
    // 模拟接口提交保存
    setTimeout(() => {
      ElMessage.success('基础信息配置保存成功！')
      loading.value = false
    }, 800)
  })
}

// 初始化加载配置
onMounted(() => {
  getConfig()
})
</script>

<style scoped>
/* 基础容器样式 */
.base-config-container {
  background-color: #fff;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 页面标题栏（和角色管理/一级模块配置统一风格） */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.save-btn {
  background-color: #2f54eb;
  border-color: #2f54eb;
}

/* 配置表单容器 */
.config-form-container {
  background-color: #f5f7fa;
  padding: 24px;
  border-radius: 4px;
}

.config-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.el-form-item {
  margin-bottom: 24px;
}
</style>