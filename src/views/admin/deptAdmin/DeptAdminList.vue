<template>
  <div class="dept-admin-list">
    <div class="page-header">
      <h2>院系管理员管理</h2>
      <div class="operate-group">
        <el-button type="primary" @click="openAddDialog">新增院系管理员</el-button>
        <el-button text @click="handleExport">导出列表</el-button>
      </div>
    </div>

    <el-card shadow="hover" class="search-card">
      <el-form :model="searchForm" label-width="100px" inline>
        <el-form-item label="登录账号">
          <el-input v-model="searchForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-select v-model="searchForm.deptId" placeholder="请选择院系">
            <el-option label="计算机学院" value="1" />
            <el-option label="电子信息学院" value="2" />
            <el-option label="文学院" value="3" />
            <el-option label="外国语学院" value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
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
        <el-table-column label="联系方式" prop="phone" width="150" />
        <el-table-column label="账号状态" prop="status" width="120">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === 1">启用</el-tag>
            <el-tag type="danger" v-else>禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="200" />
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button text @click="openDetailDialog(scope.row.id)">查看详情</el-button>
            <el-button text @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button
                text
                :type="scope.row.status === 1 ? 'danger' : 'success'"
                @click="handleStatusChange(scope.row.id, scope.row.status === 1 ? 0 : 1)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button text type="warning" @click="handleResetPwd(scope.row.id)">重置密码</el-button>
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
    <el-dialog v-model="addDialogVisible" title="新增院系管理员" width="600px" destroy-on-close>
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入登录账号（4-50字符）" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入真实姓名（2-50字符）" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="addForm.deptId" placeholder="请选择所属院系">
            <el-option label="计算机学院" value="1" />
            <el-option label="电子信息学院" value="2" />
            <el-option label="文学院" value="3" />
            <el-option label="外国语学院" value="10" />
          </el-select>
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
    <el-dialog v-model="editDialogVisible" title="编辑院系管理员" width="600px" destroy-on-close>
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
        <el-form-item label="登录账号">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="editForm.deptId" placeholder="请选择所属院系">
            <el-option label="计算机学院" value="1" />
            <el-option label="电子信息学院" value="2" />
            <el-option label="文学院" value="3" />
            <el-option label="外国语学院" value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="账号状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDeptAdminPage,
  addDeptAdmin,
  updateDeptAdmin,
  updateDeptAdminStatus,
  resetDeptAdminPwd,
  exportDeptAdminList
} from '@/api/admin/deptAdmin'
import { exportExcel } from '@/utils/export'

// =============== 数据定义 ===============
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  username: '',
  name: '',
  deptId: '',
  status: ''
})

const deptMap = {
  '1': '计算机学院',
  '2': '电子信息学院',
  '3': '文学院',
  '10': '外国语学院'
}

// =============== 新增弹窗 ===============
const addDialogVisible = ref(false)
const addFormRef = ref(null)
const addForm = reactive({
  username: '',
  name: '',
  deptId: '',
  phone: '',
  password: ''
})
const addRules = reactive({
  username: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    { min: 4, max: 50, message: '账号长度为4-50字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50字符', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择所属院系', trigger: 'change' }],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20字符', trigger: 'blur' }
  ]
})

// =============== 编辑弹窗 ===============
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: null,
  username: '',
  name: '',
  deptId: '',
  phone: '',
  status: 1
})
const editRules = reactive({
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50字符', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择所属院系', trigger: 'change' }],
  phone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  status: [{ required: true, message: '请选择账号状态', trigger: 'change' }]
})

// =============== 获取列表 ===============
const fetchDeptAdminList = async () => {
  try {
    const res = await getDeptAdminPage({
      ...searchForm,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });

    if (res.code === 200) {
      tableData.value = res.data?.records || [];
      total.value = res.data?.total || 0;
    } else {
      ElMessage.error(res.msg || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求异常：' + (error.message || '网络错误'));
  }
};

onMounted(() => {
  fetchDeptAdminList()
})

// =============== 操作方法 ===============
const openAddDialog = () => {
  addDialogVisible.value = true
}

const handleAdd = async () => {
  try {
    await addFormRef.value.validate()

    const submitData = {
      ...addForm,
      deptName: deptMap[addForm.deptId] || ''
    }

    const res = await addDeptAdmin(submitData)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      addDialogVisible.value = false
      fetchDeptAdminList()
      addFormRef.value.resetFields()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('新增失败：' + (error.message || '系统异常'))
  }
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  // ✅ 关键：解构赋值避免响应式污染
  const { id, username, name, deptId, phone, status } = row
  Object.assign(editForm, { id, username, name, deptId, phone, status })
  editDialogVisible.value = true
}

// 提交编辑
const handleEdit = async () => {
  try {
    await editFormRef.value.validate()

    const updateDTO = {
      id: editForm.id,
      name: editForm.name,
      deptId: editForm.deptId,
      deptName: deptMap[editForm.deptId] || '',
      phone: editForm.phone,
      status: editForm.status
    }

    const res = await updateDeptAdmin(updateDTO)
    if (res.code === 200) {
      ElMessage.success('编辑成功')
      editDialogVisible.value = false
      fetchDeptAdminList()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('编辑失败：' + (error.message || '系统异常'))
  }
}

const handleSearch = () => {
  pageNum.value = 1
  fetchDeptAdminList()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    username: '',
    name: '',
    deptId: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchDeptAdminList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  fetchDeptAdminList()
}

// ✅ 修复：启用/禁用 —— 显示具体错误（包括 403）
const handleStatusChange = async (id, status) => {
  const action = status === 1 ? '启用' : '禁用'
  ElMessageBox.confirm(`确定要${action}该账号吗？`, '提示').then(async () => {
    try {
      const res = await updateDeptAdminStatus(id, status)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        fetchDeptAdminList()
      } else {
        ElMessage.error(res.msg || `${action}失败`)
      }
    } catch (error) {
      // ✅ 能捕获 403、500 等错误
      const msg = error.response?.data?.msg || error.message || '网络错误'
      ElMessage.error(`${action}失败：${msg}`)
    }
  }).catch(() => {})
}

// ✅ 修复：重置密码 —— 显示具体错误
const handleResetPwd = async (id) => {
  ElMessageBox.confirm('重置后密码为123456，是否继续？', '提示').then(async () => {
    try {
      const res = await resetDeptAdminPwd(id)
      if (res.code === 200) {
        ElMessage.success(res.msg)
      } else {
        ElMessage.error(res.msg || '重置失败')
      }
    } catch (error) {
      const msg = error.response?.data?.msg || error.message || '网络错误'
      ElMessage.error('重置失败：' + msg)
    }
  }).catch(() => {})
}

// =============== 导出 ===============
const handleExport = async () => {
  try {
    const blob = await exportDeptAdminList(searchForm)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '院系管理员列表.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败：' + (error.message || '网络错误'))
  }
}

const openDetailDialog = (id) => {
  ElMessage.info('ID 为 ' + id + ' 的详情暂未实现')
}
</script>

<style scoped>
.dept-admin-list { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.operate-group { display: flex; gap: 10px; }
.search-card { margin-bottom: 20px; }
.table-card { min-height: 500px; }
.pagination { margin-top: 20px; text-align: right; }
</style>