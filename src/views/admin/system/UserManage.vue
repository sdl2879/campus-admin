<template>
  <div class="user-manage-page">
    <!-- 标题+角色筛选栏 -->
    <div class="header-section">
      <h2 class="page-title">用户管理</h2>
      <div class="role-filter">
        <el-button
            v-for="item in roleList"
            :key="item"
            type="primary"
            :plain="activeRole !== item"
            @click="activeRole = item"
            size="small"
            style="margin-right: 8px;"
        >
          {{ item }}
        </el-button>
      </div>
    </div>

    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <el-button type="primary" size="small" icon="Plus">新增用户</el-button>
      <el-button type="success" size="small" icon="Upload">导入用户</el-button>
      <el-button type="warning" size="small" icon="Download">导出用户</el-button>
      <el-button type="danger" size="small" icon="Delete">批量删除</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          placeholder="账号/姓名"
          v-model="searchForm.keyword"
          style="width: 180px; margin-right: 10px;"
          size="small"
      />
      <el-select
          placeholder="全部角色"
          v-model="searchForm.role"
          :disabled="activeRole !== '全部'"
          style="width: 120px; margin-right: 10px;"
          size="small"
      >
        <el-option label="全部角色" value="" />
        <el-option label="系统管理员" value="系统管理员" />
        <el-option label="院系管理员" value="院系管理员" />
        <el-option label="活动负责人" value="活动负责人" />
        <el-option label="学生" value="学生" />
      </el-select>
      <el-select
          placeholder="全部状态"
          v-model="searchForm.status"
          style="width: 120px; margin-right: 10px;"
          size="small"
      >
        <el-option label="全部状态" value="" />
        <el-option label="正常" value="正常" />
        <el-option label="异常/禁用" value="异常/禁用" />
      </el-select>
      <el-button type="primary" size="small" icon="Search" @click="handleSearch">搜索</el-button>
      <el-button type="default" size="small" icon="Refresh" @click="handleReset">重置</el-button>
    </div>

    <!-- 表格（重点优化操作列） -->
    <el-table
        :data="filteredUserList"
        border
        style="width: 100%;"
        size="small"
        :header-cell-style="{ 'text-align': 'center', 'font-weight': '500', 'background': '#f8f9fa' }"
        :cell-style="{ 'text-align': 'center' }"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="用户ID" width="80" />
      <el-table-column prop="account" label="账号" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag
              :type="getRoleTagType(scope.row.role)"
              size="small"
          >
            {{ scope.row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dept" label="所属院系" width="150" />
      <el-table-column prop="status" label="账号状态" width="120">
        <template #default="scope">
          <el-tag
              :type="scope.row.status === '正常' ? 'success' : 'danger'"
              size="small"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <!-- 操作列：重点优化 - 固定宽度+按钮等间距+换行适配 -->
      <el-table-column label="操作" width="240">
        <template #default="scope">
          <div class="operate-btn-group">
            <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="warning" size="mini" @click="handleResetPwd(scope.row)">重置密码</el-button>
            <!-- 换行处理：小屏幕自动换行，保持整齐 -->
            <el-button type="info" size="mini" @click="handleTag(scope.row)">标签管理</el-button>
            <el-button
                :type="scope.row.status === '正常' ? 'danger' : 'success'"
                size="mini"
                @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === '正常' ? '禁用' : '启用' }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <span class="total-count">Total {{ filteredUserList.length }}</span>
      <el-select
          v-model="pageSize"
          style="width: 80px; margin: 0 10px;"
          size="small"
      >
        <el-option label="5/page" value="5" />
        <el-option label="10/page" value="10" />
        <el-option label="20/page" value="20" />
      </el-select>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5, 10, 20]"
          :page-size="pageSize"
          layout="prev, pager, next, jumper"
          :total="filteredUserList.length"
          size="small"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 角色筛选列表
const roleList = ['全部', '院系管理员', '活动负责人', '学生']
const activeRole = ref('全部')

// 搜索表单
const searchForm = ref({
  keyword: '',
  role: '',
  status: ''
})

// 分页配置
const currentPage = ref(1)
const pageSize = ref(5)

// 模拟用户数据
const userList = ref([
  { id: 1, account: 'admin', name: '系统管理员', role: '系统管理员', dept: '校管理处', status: '正常', createTime: '2026-01-01 10:00:00' },
  { id: 2, account: 'dept01', name: '张院管', role: '院系管理员', dept: '计算机学院', status: '正常', createTime: '2026-01-02 10:00:00' },
  { id: 3, account: 'activity01', name: '李活动', role: '活动负责人', dept: '校团委', status: '正常', createTime: '2026-01-03 10:00:00' },
  { id: 4, account: '2023001', name: '王小生', role: '学生', dept: '计算机学院', status: '正常', createTime: '2026-01-04 10:00:00' },
  { id: 5, account: '2023002', name: '李小生', role: '学生', dept: '文学院', status: '异常/禁用', createTime: '2026-01-05 10:00:00' }
])

// 筛选后的数据
const filteredUserList = ref([])

// 角色标签类型
const getRoleTagType = (role) => {
  switch (role) {
    case '系统管理员': return 'danger'
    case '院系管理员': return 'warning'
    case '活动负责人': return 'info'
    case '学生': return 'success'
    default: return ''
  }
}

// 筛选逻辑
const updateFilterList = () => {
  filteredUserList.value = userList.value.filter(item => {
    if (activeRole.value !== '全部' && item.role !== activeRole.value && item.role !== '系统管理员') return false
    if (searchForm.value.keyword && !`${item.account}${item.name}`.includes(searchForm.value.keyword)) return false
    if (searchForm.value.role && item.role !== searchForm.value.role) return false
    if (searchForm.value.status && item.status !== searchForm.value.status) return false
    return true
  })
}

// 监听筛选条件变化
watch([activeRole, searchForm], () => {
  currentPage.value = 1
  updateFilterList()
}, { deep: true, immediate: true })

// 搜索/重置
const handleSearch = () => {
  currentPage.value = 1
  updateFilterList()
  ElMessage.info('搜索完成')
}
const handleReset = () => {
  searchForm.value = { keyword: '', role: '', status: '' }
  currentPage.value = 1
  updateFilterList()
  ElMessage.info('已重置筛选条件')
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 操作方法
const handleEdit = (row) => {}
const handleResetPwd = (row) => {}
const handleTag = (row) => {}
const handleToggleStatus = (row) => {
  row.status = row.status === '正常' ? '异常/禁用' : '正常'
  ElMessage.success(`已${row.status === '正常' ? '启用' : '禁用'}用户：${row.name}`)
}
</script>

<style scoped>
/* 页面容器 */
.user-manage-page {
  padding: 20px;
  background-color: #fff;
}

/* 标题栏 */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 操作按钮栏 */
.action-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

/* 核心优化：操作列按钮组 - 完全对齐 */
.operate-btn-group {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  gap: 6px;                /* 按钮间距统一 */
  flex-wrap: wrap;         /* 小屏幕自动换行 */
  width: 100%;             /* 占满操作列宽度 */
}
/* 操作按钮强制等宽（可选，极致对齐） */
.operate-btn-group .el-button {
  min-width: 60px; /* 所有按钮最小宽度一致 */
}

/* 分页栏 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 15px;
  padding: 10px 0;
}
.total-count {
  color: #666;
  font-size: 14px;
}

/* 表格样式增强 */
.el-table {
  --el-table-row-hover-bg-color: #fafafa;
}
.el-table td {
  padding: 8px 0 !important; /* 单元格内边距统一 */
}
</style>