<template>
  <div class="sys-admin-list">
    <div class="page-header">
      <h2>系统管理员管理</h2>
      <div class="operate-group">
        <el-button type="primary" @click="openAddDialog">新增管理员</el-button>
      </div>
    </div>

    <el-card shadow="hover" class="search-card">
      <el-form :model="searchForm" label-width="100px" inline>
        <el-form-item label="登录账号">
          <el-input v-model="searchForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入姓名" />
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
        <el-table-column label="真实姓名" prop="realName" width="120" />
        <el-table-column label="联系方式" prop="phone" width="150" />
        <el-table-column label="账号状态" prop="status" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="200" />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button link type="primary" @click="openDetailDialog(scope.row.id)">查看详情</el-button>
            <el-button link type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button
                link
                :type="scope.row.status === 1 ? 'danger' : 'success'"
                @click="handleStatusChange(scope.row.id, scope.row.status === 1 ? 0 : 1)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="warning" @click="openResetPwdDialog(scope.row.id)">重置密码</el-button>
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
    <el-dialog v-model="addDialogVisible" title="新增系统管理员" width="600px" destroy-on-close>
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入登录账号（4-50字符）" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="addForm.realName" placeholder="请输入真实姓名（2-50字符）" />
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

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="resetPwdDialogVisible" title="重置密码" width="400px" destroy-on-close>
      <el-form :model="resetPwdForm" :rules="resetPwdRules" ref="resetPwdFormRef" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPwdForm.password" type="password" placeholder="请输入新密码（6-20字符）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPwd">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSysAdminPage,
  addSysAdmin,
  updateSysAdminStatus,
  resetSysAdminPwd
} from '@/api/admin/sysAdmin'

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  username: '',
  realName: '', // ✅ 使用 realName
  status: ''
})

const addDialogVisible = ref(false)
const addFormRef = ref(null)
const addForm = reactive({
  username: '',
  realName: '', // ✅ 使用 realName
  phone: '',
  password: ''
})
const addRules = reactive({
  username: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    { min: 4, max: 50, message: '账号长度为4-50字符', trigger: 'blur' }
  ],
  realName: [ // ✅ 验证 realName
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20字符', trigger: 'blur' }
  ]
})

const resetPwdDialogVisible = ref(false)
const resetPwdFormRef = ref(null)
const resetPwdForm = reactive({ id: '', password: '' })
const resetPwdRules = reactive({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20字符', trigger: 'blur' }
  ]
})

const fetchSysAdminList = async () => {
  try {
    const res = await getSysAdminPage({
      ...searchForm,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    // ✅ MyBatis-Plus 分页返回的是 records，不是 list！
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (error) {
    ElMessage.error('查询失败：' + (error.message || '系统异常'))
  }
}

onMounted(() => {
  fetchSysAdminList()
})

const openAddDialog = () => {
  addDialogVisible.value = true
}

const handleAdd = async () => {
  try {
    await addFormRef.value.validate()
    const res = await addSysAdmin(addForm)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      addDialogVisible.value = false
      fetchSysAdminList()
      addFormRef.value.resetFields()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('新增失败：' + (error.message || '系统异常'))
  }
}

const handleSearch = () => {
  pageNum.value = 1
  fetchSysAdminList()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    username: '',
    realName: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchSysAdminList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  fetchSysAdminList()
}

const handleStatusChange = async (id, status) => {
  const action = status === 1 ? '启用' : '禁用'
  ElMessageBox.confirm(`确定要${action}该管理员账号吗？`, '提示').then(async () => {
    const res = await updateSysAdminStatus(id, status)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      fetchSysAdminList()
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(() => {})
}

const openResetPwdDialog = (id) => {
  resetPwdForm.id = id
  resetPwdForm.password = ''
  resetPwdDialogVisible.value = true
}

const confirmResetPwd = async () => {
  try {
    await resetPwdFormRef.value.validate()
    // ⚠️ 注意：你提供的 resetSysAdminPwd 只传 id，但通常需要新密码
    // 如果后端要求传 password，请修改为：
    // await resetSysAdminPwd({ id: resetPwdForm.id, password: resetPwdForm.password })
    const res = await resetSysAdminPwd(resetPwdForm.id)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      resetPwdDialogVisible.value = false
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('重置失败：' + (error.message || '系统异常'))
  }
}

// 占位方法（后续可实现）
const openDetailDialog = (id) => console.log('查看详情:', id)
const openEditDialog = (row) => console.log('编辑:', row)
</script>

<style scoped>
.sys-admin-list { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.operate-group { display: flex; gap: 10px; }
.search-card { margin-bottom: 20px; }
.table-card { min-height: 500px; }
.pagination { margin-top: 20px; text-align: right; }
</style>