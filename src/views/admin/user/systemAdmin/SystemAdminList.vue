<template>
  <div class="system-admin-list">
    <!-- 查询表单 -->
    <el-form :inline="true" :model="queryForm" class="query-form">
      <el-form-item label="管理员名称">
        <el-input v-model="queryForm.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="账号">
        <el-input v-model="queryForm.username" placeholder="请输入账号"></el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择状态">
          <el-option label="启用" value="1"></el-option>
          <el-option label="禁用" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getAdminList"><el-icon><Search /></el-icon>查询</el-button>
        <el-button @click="resetQuery"><el-icon><Refresh /></el-icon>重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="operate-btn">
      <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增管理员</el-button>
      <el-button type="warning" @click="handleImport"><el-icon><Upload /></el-icon>批量导入</el-button>
      <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出数据</el-button>
    </div>

    <!-- 批量导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="批量导入管理员" width="500px">
      <el-upload
          class="upload-demo"
          action="/api/admin/systemAdmin/import"
          :on-change="handleFileChange"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :auto-upload="false"
          ref="uploadRef"
          :limit="1"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">拖拽Excel文件至此上传，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">仅支持.xlsx/.xls格式，文件大小不超过5MB</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">确认上传</el-button>
      </div>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑管理员' : '新增管理员'" width="600px">
      <el-form :model="adminForm" :rules="adminRules" ref="adminFormRef" label-width="100px">
        <el-form-item label="管理员账号" prop="username">
          <el-input v-model="adminForm.username" placeholder="请输入管理员账号" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="管理员名称" prop="name">
          <el-input v-model="adminForm.name" placeholder="请输入管理员名称"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="adminForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="adminForm.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>
        <el-form-item label="所属角色" prop="roleId">
          <el-select v-model="adminForm.roleId" placeholder="请选择所属角色">
            <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="adminForm.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" v-if="!isEdit">
          <el-input v-model="adminForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息（选填）"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ isEdit ? '修改' : '新增' }}</el-button>
      </div>
    </el-dialog>

    <!-- 管理员列表 -->
    <el-table :data="adminList" border stripe style="width: 100%" :loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
      <el-table-column prop="username" label="管理员账号" min-width="120"></el-table-column>
      <el-table-column prop="name" label="管理员名称" min-width="120"></el-table-column>
      <el-table-column prop="phone" label="联系电话" min-width="120"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="150"></el-table-column>
      <el-table-column prop="roleName" label="所属角色" min-width="120"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180"></el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              active-value="1"
              inactive-value="0"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200" align="center">
        <template #default="scope">
          <el-button type="text" @click="handleEdit(scope.row)"><el-icon><Edit /></el-icon>编辑</el-button>
          <el-button type="text" @click="handleResetPwd(scope.row)"><el-icon><Key /></el-icon>重置密码</el-button>
          <el-button type="text" danger @click="handleDelete(scope.row)"><el-icon><Delete /></el-icon>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right"
    >
    </el-pagination>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import { useRouter } from 'vue-router'
// 导入图标
import { Search, Refresh, Plus, Upload, Download, Edit, Key, Delete } from '@element-plus/icons-vue'

// 临时注释掉不存在的接口导入，避免编译错误
// import {
//   getSystemAdminList,
//   addSystemAdmin,
//   editSystemAdmin,
//   updateAdminStatus,
//   resetAdminPassword,
//   importSystemAdmin,
//   getRoleAll
// } from '@/api/user/systemAdmin'

const router = useRouter()

// 查询表单
const queryForm = reactive({
  name: '',
  username: '',
  status: ''
})

// 列表数据
const adminList = ref([])
const roleList = ref([]) // 角色列表
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 弹窗相关
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)
const adminFormRef = ref(null)
const uploadRef = ref(null)
const fileList = ref([])

// 表单数据
const adminForm = reactive({
  id: '',
  username: '',
  name: '',
  phone: '',
  email: '',
  roleId: '',
  status: '1',
  remark: ''
})

// 表单校验规则
const adminRules = reactive({
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号仅支持英文、数字、下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入管理员名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择所属角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 获取管理员列表（模拟接口）
const getAdminList = () => {
  loading.value = true
  // 模拟接口请求
  setTimeout(() => {
    adminList.value = [
      {
        id: 1,
        username: 'admin',
        name: '系统超级管理员',
        phone: '13800138000',
        email: 'admin@campus.com',
        roleId: 1,
        roleName: '超级管理员',
        createTime: '2026-01-01 00:00:00',
        status: '1'
      },
      {
        id: 2,
        username: 'dept_admin',
        name: '测试院系管理员',
        phone: '13800138001',
        email: 'dept@campus.com',
        roleId: 2,
        roleName: '院系管理员',
        createTime: '2026-01-02 00:00:00',
        status: '1'
      }
    ]
    total.value = 2
    loading.value = false
  }, 500)
}

// 获取角色列表（模拟接口）
const getRoleList = () => {
  // 模拟接口请求
  roleList.value = [
    { id: 1, roleName: '超级管理员' },
    { id: 2, roleName: '院系管理员' },
    { id: 3, roleName: '活动负责人' }
  ]
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryForm, {
    name: '',
    username: '',
    status: ''
  })
  getAdminList()
}

// 新增管理员
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  // 重置表单
  resetForm()
}

// 编辑管理员
const handleEdit = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  // 赋值表单
  Object.assign(adminForm, {
    id: row.id,
    username: row.username,
    name: row.name,
    phone: row.phone,
    email: row.email,
    roleId: row.roleId,
    status: row.status
  })
}

// 重置密码
const handleResetPwd = (row) => {
  ElMessageBox.confirm(
      `确定要重置【${row.name}】的密码吗？重置后密码为123456`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    // 模拟重置密码接口
    setTimeout(() => {
      ElMessage.success('密码重置成功')
    }, 500)
  }).catch(() => {
    ElMessage.info('已取消重置')
  })
}

// 删除管理员
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除【${row.name}】吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
  ).then(() => {
    // 模拟删除
    adminList.value = adminList.value.filter(item => item.id !== row.id)
    total.value -= 1
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 状态切换
const handleStatusChange = (row) => {
  const statusText = row.status === '1' ? '启用' : '禁用'
  ElMessageBox.confirm(
      `确定要${statusText}【${row.name}】吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: row.status === '1' ? 'warning' : 'success'
      }
  ).then(() => {
    ElMessage.success(`已${statusText}【${row.name}】`)
  }).catch(() => {
    // 回滚状态
    row.status = row.status === '1' ? '0' : '1'
    ElMessage.info('已取消操作')
  })
}

// 批量导入
const handleImport = () => {
  importDialogVisible.value = true
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 文件改变
const handleFileChange = (file, list) => {
  fileList.value = list
  // 只保留最后一个文件
  if (list.length > 1) {
    fileList.value = [list[list.length - 1]]
  }
  // 文件格式校验
  const isXlsx = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const isXls = file.raw.type === 'application/vnd.ms-excel'
  if (!isXlsx && !isXls) {
    ElMessage.error('请上传Excel格式文件（.xlsx/.xls）')
    fileList.value = []
    return
  }
  // 文件大小校验
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过5MB')
    fileList.value = []
    return
  }
}

// 提交上传
const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  uploadRef.value.submit()
}

// 上传成功
const handleUploadSuccess = (response) => {
  ElMessage.success('导入成功')
  importDialogVisible.value = false
  fileList.value = []
  getAdminList() // 重新获取列表
}

// 上传失败
const handleUploadError = (error) => {
  ElMessage.error('导入失败，请重试')
  console.error('上传失败：', error)
}

// 重置表单
const resetForm = () => {
  if (adminFormRef.value) {
    adminFormRef.value.resetFields()
  }
  Object.assign(adminForm, {
    id: '',
    username: '',
    name: '',
    phone: '',
    email: '',
    roleId: '',
    status: '1',
    remark: ''
  })
}

// 提交表单
const submitForm = () => {
  adminFormRef.value.validate((valid) => {
    if (!valid) return

    loading.value = true
    // 模拟接口请求
    setTimeout(() => {
      if (isEdit.value) {
        // 编辑逻辑
        const index = adminList.value.findIndex(item => item.id === adminForm.id)
        if (index > -1) {
          Object.assign(adminList.value[index], {
            name: adminForm.name,
            phone: adminForm.phone,
            email: adminForm.email,
            roleId: adminForm.roleId,
            roleName: roleList.value.find(r => r.id === adminForm.roleId)?.roleName || '',
            status: adminForm.status
          })
        }
        ElMessage.success('管理员修改成功')
      } else {
        // 新增逻辑
        const newAdmin = {
          ...adminForm,
          id: Date.now(), // 模拟ID
          roleName: roleList.value.find(r => r.id === adminForm.roleId)?.roleName || '',
          createTime: new Date().toLocaleString()
        }
        adminList.value.unshift(newAdmin)
        total.value += 1
        ElMessage.success('管理员新增成功')
      }
      loading.value = false
      dialogVisible.value = false
      resetForm()
    }, 500)
  })
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getAdminList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  getAdminList()
}

// 初始化
onMounted(() => {
  getRoleList()
  getAdminList()
})
</script>

<style scoped>
.system-admin-list {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.query-form {
  margin-bottom: 20px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 4px;
}

.operate-btn {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.upload-demo {
  margin: 10px 0;
  padding: 30px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
}

.upload-demo:hover {
  border-color: #409eff;
}

.el-upload__text {
  margin-top: 8px;
  color: #666;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  text-align: right;
}
</style>