<template>
  <div class="operation-log-container">
    <!-- 1. 页面标题栏（和其他子模块统一风格） -->
    <div class="page-header">
      <h3>操作日志</h3>
      <div class="header-actions">
        <el-button type="success" class="export-btn" @click="exportLog">导出日志</el-button>
        <el-button type="warning" class="clear-btn" @click="clearLog">清空日志</el-button>
      </div>
    </div>

    <!-- 2. 高级搜索栏（适配日志多条件筛选） -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="操作人">
          <el-input
              v-model="searchForm.operator"
              placeholder="请输入操作人账号/名称"
              clearable
              class="search-input"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select
              v-model="searchForm.operType"
              placeholder="请选择操作类型"
              clearable
              class="search-select"
          >
            <el-option label="新增" value="add" />
            <el-option label="编辑" value="edit" />
            <el-option label="删除" value="delete" />
            <el-option label="查询" value="query" />
            <el-option label="登录" value="login" />
            <el-option label="退出" value="logout" />
            <el-option label="配置修改" value="config" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              clearable
          />
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select
              v-model="searchForm.operStatus"
              placeholder="请选择操作状态"
              clearable
              class="search-select"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="query-btn" @click="getLogList">查询</el-button>
          <el-button class="reset-btn" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 3. 日志列表表格 -->
    <div class="table-container">
      <el-table
          :data="logList"
          border
          stripe
          :loading="loading"
          :empty-text="emptyText"
          class="log-table"
          v-loading="loading"
      >
        <el-table-column prop="id" label="日志ID" width="100" align="center" />
        <el-table-column prop="operator" label="操作人" min-width="120" align="center" />
        <el-table-column prop="operTime" label="操作时间" min-width="180" align="center" />
        <el-table-column prop="operType" label="操作类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.operType)">
              {{ getOperTypeName(scope.row.operType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operModule" label="操作模块" min-width="120" align="center" />
        <el-table-column prop="operContent" label="操作内容" min-width="200" />
        <el-table-column prop="operIp" label="操作IP" min-width="120" align="center" />
        <el-table-column prop="operStatus" label="操作状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.operStatus === 'success' ? 'success' : 'danger'">
              {{ scope.row.operStatus === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="errorMsg" label="错误信息" min-width="200">
          <template #default="scope">
            <el-popover
                trigger="hover"
                placement="top"
                width="400"
                v-if="scope.row.errorMsg"
            >
              <pre>{{ scope.row.errorMsg }}</pre>
              <span slot="reference" class="error-msg">查看详情</span>
            </el-popover>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件（统一风格） -->
      <div class="pagination-bar" v-if="total > 0">
        <span class="total-text">总计 {{ total }} 条日志</span>
        <el-select
            v-model="pageSize"
            @change="handleSizeChange"
            class="page-size-select"
        >
          <el-option label="10条/页" value="10" />
          <el-option label="20条/页" value="20" />
          <el-option label="50条/页" value="50" />
          <el-option label="100条/页" value="100" />
        </el-select>
        <el-pagination
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            class="pagination"
        />
        <span class="go-to-text">跳至</span>
        <el-input
            v-model="goToPage"
            type="number"
            min="1"
            :max="Math.ceil(total / pageSize)"
            @change="handleGoToPage"
            class="go-to-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/********************************************************************
 * 文件名：OperationLog.vue
 * 存放路径：src/views/admin/system/log/OperationLog.vue
 * 功能描述：系统操作日志查看页面，支持多条件筛选、导出、清空日志等功能
 * 依赖说明：
 *  1. element-plus：UI组件库（表格、表单、标签、弹窗等）
 *  2. vue：核心框架（响应式、计算属性等）
 ********************************************************************/
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const loading = ref(false)           // 表格加载状态
const logList = ref([])              // 操作日志列表
const total = ref(0)                 // 日志总条数
const pageNum = ref(1)               // 当前页码
const pageSize = ref(10)             // 每页条数
const goToPage = ref(1)              // 跳转页码
const emptyText = ref('暂无操作日志数据') // 空数据提示

// 搜索表单（多条件筛选）
const searchForm = reactive({
  operator: '',         // 操作人
  operType: '',         // 操作类型
  dateRange: [],        // 操作时间范围
  operStatus: ''        // 操作状态
})

// 操作类型映射（用于显示中文名称）
const operTypeMap = {
  add: '新增',
  edit: '编辑',
  delete: '删除',
  query: '查询',
  login: '登录',
  logout: '退出',
  config: '配置修改'
}

// 操作类型标签颜色映射
const tagTypeMap = {
  add: 'success',
  edit: 'primary',
  delete: 'danger',
  query: 'info',
  login: 'warning',
  logout: 'gray',
  config: 'purple'
}

// 获取操作类型中文名称
const getOperTypeName = (type) => {
  return operTypeMap[type] || '未知'
}

// 获取操作类型标签颜色
const getTagType = (type) => {
  return tagTypeMap[type] || 'default'
}

// 获取操作日志列表（模拟接口）
const getLogList = () => {
  loading.value = true
  // 模拟接口请求，实际项目替换为真实后端接口
  setTimeout(() => {
    const mockData = [
      {
        id: 1,
        operator: 'admin',
        operTime: '2026-01-25 09:05:30',
        operType: 'login',
        operModule: '系统管理',
        operContent: '管理员admin登录系统，IP：127.0.0.1',
        operIp: '127.0.0.1',
        operStatus: 'success',
        errorMsg: ''
      },
      {
        id: 2,
        operator: 'admin',
        operTime: '2026-01-25 09:10:20',
        operType: 'add',
        operModule: '一级模块配置',
        operContent: '新增一级模块：智能推荐管理，编码：recommend',
        operIp: '127.0.0.1',
        operStatus: 'success',
        errorMsg: ''
      },
      {
        id: 3,
        operator: 'test',
        operTime: '2026-01-25 10:15:45',
        operType: 'edit',
        operModule: '角色管理',
        operContent: '编辑角色：活动负责人，修改权限配置',
        operIp: '192.168.1.100',
        operStatus: 'success',
        errorMsg: ''
      },
      {
        id: 4,
        operator: 'guest',
        operTime: '2026-01-25 11:20:10',
        operType: 'login',
        operModule: '系统管理',
        operContent: '用户guest尝试登录系统，IP：192.168.1.101',
        operIp: '192.168.1.101',
        operStatus: 'fail',
        errorMsg: '密码错误，错误次数：3次，账号临时锁定10分钟'
      },
      {
        id: 5,
        operator: 'admin',
        operTime: '2026-01-25 14:30:00',
        operType: 'config',
        operModule: '基础信息配置',
        operContent: '修改系统名称为：校园智能活动推荐系统V2.0',
        operIp: '127.0.0.1',
        operStatus: 'success',
        errorMsg: ''
      }
    ]

    // 筛选逻辑
    let filteredData = [...mockData]
    // 操作人筛选
    if (searchForm.operator) {
      filteredData = filteredData.filter(item => item.operator.includes(searchForm.operator))
    }
    // 操作类型筛选
    if (searchForm.operType) {
      filteredData = filteredData.filter(item => item.operType === searchForm.operType)
    }
    // 操作状态筛选
    if (searchForm.operStatus) {
      filteredData = filteredData.filter(item => item.operStatus === searchForm.operStatus)
    }
    // 时间范围筛选
    if (searchForm.dateRange.length === 2) {
      const [startDate, endDate] = searchForm.dateRange
      filteredData = filteredData.filter(item => {
        const operDate = item.operTime.split(' ')[0]
        return operDate >= startDate && operDate <= endDate
      })
    }

    logList.value = filteredData
    total.value = filteredData.length
    loading.value = false
  }, 500)
}

// 重置搜索条件
const resetSearch = () => {
  Object.assign(searchForm, {
    operator: '',
    operType: '',
    dateRange: [],
    operStatus: ''
  })
  pageNum.value = 1
  goToPage.value = 1
  getLogList()
}

// 导出日志
const exportLog = () => {
  loading.value = true
  // 模拟导出接口
  setTimeout(() => {
    ElMessage.success('操作日志导出成功！文件已下载')
    loading.value = false
  }, 800)
}

// 清空日志（带二次确认）
const clearLog = () => {
  ElMessageBox.confirm(
      '确定要清空所有操作日志吗？此操作不可恢复！',
      '危险操作',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'danger'
      }
  ).then(() => {
    loading.value = true
    // 模拟清空接口
    setTimeout(() => {
      logList.value = []
      total.value = 0
      ElMessage.success('操作日志已清空！')
      loading.value = false
    }, 800)
  }).catch(() => {
    ElMessage.info('已取消清空操作')
  })
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getLogList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  goToPage.value = val
  getLogList()
}

// 跳转指定页码
const handleGoToPage = () => {
  const maxPage = Math.ceil(total.value / pageSize.value) || 1
  goToPage.value = Math.max(1, Math.min(goToPage.value, maxPage))
  pageNum.value = goToPage.value
  getLogList()
}

// 初始化加载日志
onMounted(() => {
  getLogList()
})
</script>

<style scoped>
/* 基础容器样式 */
.operation-log-container {
  background-color: #fff;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 页面标题栏（统一风格） */
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

.header-actions {
  display: flex;
  gap: 8px;
}

.export-btn {
  background-color: #52c41a;
  border-color: #52c41a;
}

.clear-btn {
  background-color: #fa8c16;
  border-color: #fa8c16;
}

/* 搜索栏样式 */
.search-bar {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input, .search-select {
  width: 200px;
}

.query-btn {
  background-color: #2f54eb;
  border-color: #2f54eb;
  margin-right: 8px;
}

.reset-btn {
  background-color: #fff;
  color: #666;
  border-color: #dcdfe6;
}

/* 表格容器样式 */
.table-container {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.log-table {
  width: 100%;
  --el-table-row-hover-bg-color: #f5f7fa;
}

/* 错误信息样式 */
.error-msg {
  color: #f56c6c;
  cursor: pointer;
  text-decoration: underline;
}

/* 分页样式 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px;
  gap: 16px;
  background-color: #f5f7fa;
}

.total-text {
  color: #666;
  font-size: 14px;
}

.page-size-select {
  width: 100px;
}

.go-to-text {
  color: #666;
  font-size: 14px;
}

.go-to-input {
  width: 80px;
}
</style>