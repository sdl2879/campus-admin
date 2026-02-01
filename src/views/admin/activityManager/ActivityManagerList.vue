<template>
  <div class="activity-manager-list">
    <div class="page-header">
      <h2>活动负责人管理</h2>
      <div class="operate-group">
        <el-button type="primary" @click="openAddDialog">新增活动负责人</el-button>
        <el-button link @click="handleExport">导出列表</el-button>
      </div>
    </div>

    <el-card shadow="hover" class="search-card">
      <el-form :model="searchForm" label-width="120px" inline>
        <el-form-item label="登录账号">
          <el-input v-model="searchForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-select v-model="searchForm.deptId" placeholder="请选择院系" clearable>
            <el-option label="计算机学院" :value="1" />
            <el-option label="电子信息学院" :value="2" />
            <el-option label="文学院" :value="3" />
            <el-option label="外国语学院" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业">
          <el-input v-model="searchForm.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="资质状态">
          <el-select v-model="searchForm.qualificationStatus" placeholder="请选择资质状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.status" placeholder="请选择账号状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="登录账号" prop="username" width="150" />
        <el-table-column label="真实姓名" prop="name" width="120" />
        <el-table-column label="所属院系" prop="deptName" width="180" />
        <el-table-column label="所属专业" prop="major" width="180" />
        <el-table-column label="联系方式" prop="phone" width="150" />
        <el-table-column label="资质状态" prop="qualificationStatus" width="150">
          <template #default="scope">
            <el-tag v-if="scope.row.qualificationStatus === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.qualificationStatus === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已驳回</el-tag>
            <el-button
                v-if="scope.row.qualificationStatus === 2"
                link
                size="small"
                @click="showRejectReason(scope.row.rejectReason)"
            >
              查看驳回原因
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="负责活动数" prop="manageActivityCount" width="120" />
        <el-table-column label="账号状态" prop="status" width="120">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === 1">启用</el-tag>
            <el-tag type="danger" v-else>禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="200" />
        <el-table-column label="操作" width="400">
          <template #default="scope">
            <el-button link @click="openDetailDialog(scope.row)">查看详情</el-button>
            <el-button link @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
                link
                :type="scope.row.status === 1 ? 'danger' : 'success'"
                @click="handleStatusChange(scope.row.id, scope.row.status === 1 ? 0 : 1)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="warning" @click="handleResetPwd(scope.row.id)">重置密码</el-button>
            <el-button
                link
                type="primary"
                v-if="scope.row.qualificationStatus === 0"
                @click="openAuditDialog(scope.row.id)"
            >
              资质审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
      />
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addDialogVisible" title="新增活动负责人" width="600px" destroy-on-close>
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入登录账号（4-50字符）" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入真实姓名（2-50字符）" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="addForm.deptId" placeholder="请选择所属院系">
            <el-option label="计算机学院" :value="1" />
            <el-option label="电子信息学院" :value="2" />
            <el-option label="文学院" :value="3" />
            <el-option label="外国语学院" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="major">
          <el-input v-model="addForm.major" placeholder="请输入所属专业" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入初始密码（6-20字符）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确认新增</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑活动负责人" width="600px" destroy-on-close>
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入真实姓名（2-50字符）" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="editForm.deptId" placeholder="请选择所属院系">
            <el-option label="计算机学院" :value="1" />
            <el-option label="电子信息学院" :value="2" />
            <el-option label="文学院" :value="3" />
            <el-option label="外国语学院" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="major">
          <el-input v-model="editForm.major" placeholder="请输入所属专业" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="活动负责人详情" width="600px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="登录账号">{{ detailForm.username }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">{{ detailForm.deptName }}</el-descriptions-item>
        <el-descriptions-item label="所属专业">{{ detailForm.major || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detailForm.phone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="资质状态">
          <el-tag v-if="detailForm.qualificationStatus === 0" type="warning">待审核</el-tag>
          <el-tag v-else-if="detailForm.qualificationStatus === 1" type="success">已通过</el-tag>
          <el-tag v-else type="danger">已驳回</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailForm.qualificationStatus === 2" label="驳回原因">
          {{ detailForm.rejectReason || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="负责活动数">{{ detailForm.manageActivityCount }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag type="success" v-if="detailForm.status === 1">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailForm.createTime }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ detailForm.lastLoginTime || '未登录' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 资质审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="资质审核" width="500px" destroy-on-close>
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="100px">
        <el-form-item label="审核结果" prop="qualificationStatus">
          <el-select v-model="auditForm.qualificationStatus" placeholder="请选择审核结果">
            <el-option label="通过" :value="1" />
            <el-option label="驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item
            label="驳回原因"
            prop="rejectReason"
            v-if="auditForm.qualificationStatus === 2"
        >
          <el-input v-model="auditForm.rejectReason" type="textarea" :rows="5" placeholder="请输入驳回原因（不超过500字符）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAudit">确认审核</el-button>
      </template>
    </el-dialog>

    <!-- 驳回原因弹窗 -->
    <el-dialog v-model="rejectReasonVisible" title="驳回原因" width="400px" destroy-on-close>
      <div class="reject-reason-content">{{ rejectReason }}</div>
      <template #footer>
        <el-button @click="rejectReasonVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getActivityManagerPage,
  addActivityManager,
  updateActivityManager,
  deleteActivityManager,
  updateActivityManagerStatus,
  auditQualification,
  resetActivityManagerPwd,
  exportActivityManagerList,
  getActivityManagerDetail
} from '@/api/admin/activityManager'
import { exportExcel } from '@/utils/export'

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  username: '',
  name: '', // ✅ 关键：使用 name
  deptId: null,
  major: '',
  qualificationStatus: null,
  status: null
})

// 新增
const addDialogVisible = ref(false)
const addFormRef = ref(null)
const addForm = reactive({
  username: '',
  name: '', // ✅
  deptId: null,
  major: '',
  phone: '',
  password: ''
})
const addRules = reactive({
  username: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    { min: 4, max: 50, message: '账号长度为4-50字符', trigger: 'blur' }
  ],
  name: [ // ✅
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50字符', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择所属院系', trigger: 'change' }],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20字符', trigger: 'blur' }
  ]
})

// 编辑
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: null,
  username: '',
  name: '',
  deptId: null,
  major: '',
  phone: ''
})
const editRules = reactive({
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50字符', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择所属院系', trigger: 'change' }]
})

// 详情
const detailDialogVisible = ref(false)
const detailForm = reactive({
  username: '',
  name: '',
  deptName: '',
  major: '',
  phone: '',
  qualificationStatus: 0,
  rejectReason: '',
  manageActivityCount: 0,
  status: 1,
  createTime: '',
  lastLoginTime: ''
})

// 审核
const auditDialogVisible = ref(false)
const auditFormRef = ref(null)
const auditForm = reactive({
  id: '',
  qualificationStatus: 1,
  rejectReason: ''
})
const auditRules = reactive({
  qualificationStatus: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  rejectReason: [{
    required: true,
    message: '请输入驳回原因',
    trigger: 'blur',
    validator: (rule, value, callback) => {
      if (auditForm.qualificationStatus === 2 && (!value || !value.trim())) {
        callback(new Error('驳回时必须填写驳回原因'))
      } else {
        callback()
      }
    }
  }]
})

const rejectReasonVisible = ref(false)
const rejectReason = ref('')

// 获取列表
const fetchActivityManagerList = async () => {
  try {
    const params = {
      ...searchForm,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    // 清除空值（避免传 "" 影响后端）
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) delete params[key]
    })

    const res = await getActivityManagerPage(params)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    ElMessage.error('查询失败：' + (error.message || '系统异常'))
  }
}

onMounted(() => {
  fetchActivityManagerList()
})

// 搜索 & 重置
const handleSearch = () => {
  pageNum.value = 1
  fetchActivityManagerList()
}
const resetSearch = () => {
  Object.assign(searchForm, {
    username: '',
    name: '',
    deptId: null,
    major: '',
    qualificationStatus: null,
    status: null
  })
  handleSearch()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchActivityManagerList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  fetchActivityManagerList()
}

// 新增
const openAddDialog = () => {
  addDialogVisible.value = true
}
const handleAdd = async () => {
  try {
    await addFormRef.value.validate()
    const res = await addActivityManager(addForm)
    ElMessage.success(res.msg || '新增成功')
    addDialogVisible.value = false
    fetchActivityManagerList()
    addFormRef.value.resetFields()
  } catch (error) {
    ElMessage.error('新增失败：' + (error.message || '系统异常'))
  }
}

// 编辑
const openEditDialog = (row) => {
  Object.assign(editForm, { ...row })
  editDialogVisible.value = true
}
const handleEdit = async () => {
  try {
    await editFormRef.value.validate()
    const res = await updateActivityManager(editForm)
    ElMessage.success(res.msg || '修改成功')
    editDialogVisible.value = false
    fetchActivityManagerList()
  } catch (error) {
    ElMessage.error('修改失败：' + (error.message || '系统异常'))
  }
}

// 删除
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该活动负责人吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteActivityManager(id)
    ElMessage.success(res.msg || '删除成功')
    fetchActivityManagerList()
  }).catch(() => {})
}

// 详情
const openDetailDialog = async (row) => {
  try {
    const res = await getActivityManagerDetail(row.id)
    Object.assign(detailForm, res.data)
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取详情失败：' + (error.message || '系统异常'))
  }
}

// 审核
const openAuditDialog = (id) => {
  auditForm.id = id
  auditForm.qualificationStatus = 1
  auditForm.rejectReason = ''
  auditDialogVisible.value = true
}
const handleAudit = async () => {
  try {
    await auditFormRef.value.validate()
    const res = await auditQualification(auditForm)
    ElMessage.success(res.msg || '审核成功')
    auditDialogVisible.value = false
    fetchActivityManagerList()
  } catch (error) {
    ElMessage.error('审核失败：' + (error.message || '系统异常'))
  }
}

// 显示驳回原因
const showRejectReason = (reason) => {
  rejectReason.value = reason || '无具体驳回原因'
  rejectReasonVisible.value = true
}

// 启用/禁用
const handleStatusChange = async (id, status) => {
  const action = status === 1 ? '启用' : '禁用'
  ElMessageBox.confirm(`确定要${action}该活动负责人账号吗？`, '提示').then(async () => {
    const res = await updateActivityManagerStatus(id, status)
    ElMessage.success(res.msg || `${action}成功`)
    fetchActivityManagerList()
  }).catch(() => {})
}

// 重置密码
const handleResetPwd = async (id) => {
  ElMessageBox.confirm('重置后密码为123456，是否继续？', '提示').then(async () => {
    const res = await resetActivityManagerPwd(id)
    ElMessage.success(res.msg || '密码重置成功')
  }).catch(() => {})
}

// 导出
const handleExport = async () => {
  try {
    const params = { ...searchForm }
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) delete params[key]
    })
    const res = await exportActivityManagerList(params)
    exportExcel(res.data, '活动负责人列表', [
      { label: '登录账号', prop: 'username' },
      { label: '真实姓名', prop: 'name' }, // ✅
      { label: '所属院系', prop: 'deptName' },
      { label: '所属专业', prop: 'major' },
      { label: '联系方式', prop: 'phone' },
      {
        label: '资质状态',
        prop: 'qualificationStatus',
        formatter: (v) => v === 0 ? '待审核' : v === 1 ? '已通过' : '已驳回'
      },
      { label: '驳回原因', prop: 'rejectReason' },
      { label: '负责活动数', prop: 'manageActivityCount' },
      { label: '账号状态', prop: 'status', formatter: (v) => v === 1 ? '启用' : '禁用' },
      { label: '创建时间', prop: 'createTime' }
    ])
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + (error.message || '系统异常'))
  }
}
</script>

<style scoped>
.activity-manager-list { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.operate-group { display: flex; gap: 10px; }
.search-card { margin-bottom: 20px; }
.table-card { min-height: 500px; }
.pagination { margin-top: 20px; text-align: right; }
.reject-reason-content {
  padding: 10px;
  line-height: 1.8;
  color: #333;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>