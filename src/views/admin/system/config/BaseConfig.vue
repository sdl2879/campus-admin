<template>
  <div class="base-config">
    <el-card shadow="hover" class="config-card">
      <template #header>
        <div class="card-header">
          <span>系统基础信息配置</span>
          <el-button type="primary" @click="handleSave" icon="Save">保存配置</el-button>
        </div>
      </template>

      <el-form
          :model="configForm"
          :rules="configRules"
          ref="configFormRef"
          label-width="120px"
          class="config-form"
      >
        <!-- 系统基础信息 -->
        <el-form-item label="系统名称" prop="systemName">
          <el-input
              v-model="configForm.systemName"
              placeholder="请输入系统名称"
              maxlength="50"
              show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="系统简称" prop="systemShortName">
          <el-input
              v-model="configForm.systemShortName"
              placeholder="请输入系统简称"
              maxlength="20"
              show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="系统版本" prop="systemVersion">
          <el-input
              v-model="configForm.systemVersion"
              placeholder="请输入系统版本号"
              maxlength="10"
              show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="客服电话" prop="servicePhone">
          <el-input
              v-model="configForm.servicePhone"
              placeholder="请输入客服联系电话"
              maxlength="20"
              show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="客服邮箱" prop="serviceEmail">
          <el-input
              v-model="configForm.serviceEmail"
              placeholder="请输入客服邮箱地址"
              maxlength="50"
              show-word-limit
          ></el-input>
        </el-form-item>

        <!-- 网站配置 -->
        <el-divider content-position="left">网站配置</el-divider>

        <el-form-item label="网站域名" prop="websiteDomain">
          <el-input
              v-model="configForm.websiteDomain"
              placeholder="请输入网站域名（如：https://campus.com）"
              maxlength="100"
              show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="网站备案号" prop="recordNumber">
          <el-input
              v-model="configForm.recordNumber"
              placeholder="请输入网站备案号"
              maxlength="50"
              show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="版权信息" prop="copyrightInfo">
          <el-input
              v-model="configForm.copyrightInfo"
              placeholder="请输入版权信息"
              maxlength="100"
              show-word-limit
          ></el-input>
        </el-form-item>

        <!-- 其他配置 -->
        <el-divider content-position="left">其他配置</el-divider>

        <el-form-item label="是否开启推荐" prop="enableRecommend">
          <el-switch
              v-model="configForm.enableRecommend"
              active-text="开启"
              inactive-text="关闭"
              active-value="1"
              inactive-value="0"
          ></el-switch>
        </el-form-item>

        <el-form-item label="推荐算法类型" prop="recommendType">
          <el-select
              v-model="configForm.recommendType"
              placeholder="请选择推荐算法类型"
              disabled="!configForm.enableRecommend"
          >
            <el-option label="基于内容推荐" value="contentBased"></el-option>
            <el-option label="协同过滤推荐" value="collaborativeFiltering"></el-option>
            <el-option label="混合推荐算法" value="hybrid"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="数据缓存时间(分钟)" prop="cacheTime">
          <el-input-number
              v-model="configForm.cacheTime"
              :min="1"
              :max="1440"
              :step="1"
              placeholder="请输入缓存时间"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="备注信息">
          <el-input
              v-model="configForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注信息（选填）"
              maxlength="500"
              show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Save } from '@element-plus/icons-vue'

// 表单引用
const configFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 配置表单数据
const configForm = reactive({
  // 系统基础信息
  systemName: '校园智能活动推荐系统',
  systemShortName: '校园活动系统',
  systemVersion: 'V1.0.0',
  servicePhone: '13800138000',
  serviceEmail: 'service@campus.com',

  // 网站配置
  websiteDomain: 'https://campus.com',
  recordNumber: '粤ICP备20260001号',
  copyrightInfo: '©2026 校园智能活动推荐系统 版权所有',

  // 其他配置
  enableRecommend: '1',
  recommendType: 'contentBased',
  cacheTime: 30,
  remark: ''
})

// 表单校验规则
const configRules = reactive({
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '系统名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  systemShortName: [
    { required: true, message: '请输入系统简称', trigger: 'blur' },
    { min: 2, max: 20, message: '系统简称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  systemVersion: [
    { required: true, message: '请输入系统版本号', trigger: 'blur' }
  ],
  websiteDomain: [
    { required: true, message: '请输入网站域名', trigger: 'blur' },
    { pattern: /^https?:\/\/.+$/, message: '请输入合法的网址（以http/https开头）', trigger: 'blur' }
  ],
  recordNumber: [
    { required: true, message: '请输入网站备案号', trigger: 'blur' }
  ],
  copyrightInfo: [
    { required: true, message: '请输入版权信息', trigger: 'blur' }
  ],
  cacheTime: [
    { required: true, message: '请输入数据缓存时间', trigger: 'blur' }
  ],
  recommendType: [
    { required: true, message: '请选择推荐算法类型', trigger: 'change' }
  ]
})

// 获取配置信息
const getConfig = () => {
  loading.value = true
  // 模拟接口请求获取配置
  setTimeout(() => {
    // 这里可替换为真实接口请求
    loading.value = false
  }, 500)
}

// 保存配置
const handleSave = () => {
  configFormRef.value.validate((valid) => {
    if (!valid) return

    ElMessageBox.confirm(
        '确定要保存系统基础配置吗？保存后配置立即生效',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      loading.value = true
      // 模拟接口保存配置
      setTimeout(() => {
        ElMessage.success('配置保存成功！')
        loading.value = false
      }, 800)
    }).catch(() => {
      ElMessage.info('已取消保存')
    })
  })
}

// 初始化
onMounted(() => {
  getConfig()
})
</script>

<style scoped>
.base-config {
  padding: 20px;
  background-color: #f9fafb;
  min-height: calc(100vh - 100px);
}

.config-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
}

.config-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-divider {
  margin: 30px 0;
}
</style>