<template>
  <div class="role-log-container">
    <div class="page-header">
      <h3>角色权限变更日志 - {{ roleName }}</h3>
      <el-button type="primary" class="export-btn" @click="exportLog">导出日志</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人账号" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operationType" placeholder="Select" clearable>
            <el-option label="新增角色" value="ADD_ROLE" />
            <el-option label="编辑角色" value="EDIT_ROLE" />
            <el-option label="变更权限" value="UPDATE_PERMISSION" />
            <el-option label="启用角色" value="ENABLE_ROLE" />
            <el-option label="禁用角色" value="DISABLE_ROLE" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
              v-model="searchForm.operationTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="query-btn" @click="fetchRoleLog">查询</el-button>
          <el-button class="reset-btn" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 日志表格 -->
    <div class="table-container">
      <el-table
          :data="logList"
          border
          stripe
          :loading="tableLoading"
          :empty-text="emptyText"
          class="log-table"
      >
        <el-table-column label="No" type="index" width="60" align="center" />
        <el-table-column label="操作人" prop="operator" align="center" />
        <el-table-column label="操作人名称" prop="operatorName" align="center" />
        <el-table-column label="操作类型" prop="operationType" align="center">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.operationType)">
              {{ getOperationTypeName(scope.row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" prop="operationTime" align="center" width="180" />
        <el-table-column label="操作IP" prop="operationIp" align="center" />
        <el-table-column label="变更内容" prop="changeContent" align="center" width="300">
          <template #default="scope">
            <el-popover
                trigger="hover"
                placement="top"
                width="600"
                content-class="log-content-popover"
            >
              <template #default>
                <pre class="log-content">{{ scope.row.changeContent }}</pre>
              </template>
              <span class="ellipsis-text">{{ scope.row.changeContent }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作状态" prop="operationStatus" align="center" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.operationStatus === 'SUCCESS' ? 'success' : 'danger'">
              {{ scope.row.operationStatus === 'SUCCESS' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar" v-if="pageInfo.total > 0">
        <span class="total-text">Total {{ pageInfo.total }}</span>
        <el-select
            v-model="pageInfo.pageSize"
            @change="handleSizeChange"
            class="page-size-select"
        >
          <el-option label="10" value="10" />
          <el-option label="20" value="20" />
          <el-option label="50" value="50" />
        </el-select>
        <el-pagination
            @current-change="handleCurrentChange"
            :current-page="pageInfo.currentPage"
            :page-size="pageInfo.pageSize"
            :total="pageInfo.total"
            layout="prev, pager, next"
            class="pagination"
        />
        <span class="go-to-text">Go to</span>
        <el-input
            v-model="goToPage"
            type="number"
            min="1"
            :max="Math.ceil(pageInfo.total / pageInfo.pageSize)"
            @change="handleGoToPage"
            class="go-to-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. 导入依赖
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';

// 2. 模拟接口（后续替换为真实接口）
const getRoleLog = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: [
            {
              id: '1',
              operator: 'admin',
              operatorName: '超级管理员',
              operationType: 'ADD_ROLE',
              operationTime: '2026-01-01 10:30:00',
              operationIp: '192.168.1.100',
              changeContent: '新增角色：系统管理员，角色标识：sys_admin，状态：启用',
              operationStatus: 'SUCCESS'
            },
            {
              id: '2',
              operator: 'dept_admin',
              operatorName: '计算机学院管理员',
              operationType: 'UPDATE_PERMISSION',
              operationTime: '2026-01-02 14:15:00',
              operationIp: '192.168.1.101',
              changeContent: '为角色【院系管理员】分配权限：菜单【学生管理】、操作【导入学生】',
              operationStatus: 'SUCCESS'
            }
          ],
          total: 2
        }
      });
    }, 500);
  });
};
const exportRoleLog = (params) => {
  return new Promise((resolve) => {
    // 模拟二进制流响应
    const blob = new Blob(['日志内容'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    resolve({ data: blob });
  });
};

// 3. 定义所有模板变量（完整初始化）
const route = useRoute();

// 当前角色ID
const roleId = ref(route.params.roleId || '');
// 角色名称
const roleName = ref('未知角色');

// 表格相关
const tableLoading = ref(false);
const logList = ref([]);
const emptyText = ref('No Data');

// 搜索表单
const searchForm = reactive({
  operator: '',
  operationType: '',
  operationTime: [] // 时间范围：[开始日期, 结束日期]
});

// 分页信息
const pageInfo = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});
const goToPage = ref(1);

// 操作类型映射
const operationTypeMap = ref({
  ADD_ROLE: '新增角色',
  EDIT_ROLE: '编辑角色',
  UPDATE_PERMISSION: '变更权限',
  ENABLE_ROLE: '启用角色',
  DISABLE_ROLE: '禁用角色'
});

// 标签样式映射
const tagTypeMap = ref({
  ADD_ROLE: 'primary',
  EDIT_ROLE: 'success',
  UPDATE_PERMISSION: 'warning',
  ENABLE_ROLE: 'info',
  DISABLE_ROLE: 'danger'
});

// 4. 定义所有方法
// 获取操作类型中文名称
const getOperationTypeName = (type) => {
  return operationTypeMap.value[type] || type;
};

// 获取标签样式
const getTagType = (type) => {
  return tagTypeMap.value[type] || 'default';
};

// 获取角色变更日志
const fetchRoleLog = async () => {
  try {
    tableLoading.value = true;
    const params = {
      roleId: roleId.value,
      operator: searchForm.operator,
      operationType: searchForm.operationType,
      startTime: searchForm.operationTime[0] || '',
      endTime: searchForm.operationTime[1] || '',
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize
    };
    const res = await getRoleLog(params);
    if (res.code === 200) {
      logList.value = res.data.list || [];
      pageInfo.total = res.data.total || 0;
      // 从第一条日志获取角色名称（如果未设置）
      if (logList.value.length > 0 && roleName.value === '未知角色') {
        roleName.value = logList.value[0].roleName || '未知角色';
      }
    } else {
      ElMessage.error(res.msg || '获取角色变更日志失败');
    }
  } catch (error) {
    ElMessage.error('获取角色变更日志异常');
    console.error(error);
  } finally {
    tableLoading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.operator = '';
  searchForm.operationType = '';
  searchForm.operationTime = [];
  pageInfo.currentPage = 1;
  goToPage.value = 1;
  fetchRoleLog();
};

// 分页相关方法
const handleSizeChange = (size) => {
  pageInfo.pageSize = size;
  fetchRoleLog();
};
const handleCurrentChange = (page) => {
  pageInfo.currentPage = page;
  goToPage.value = page;
  fetchRoleLog();
};
const handleGoToPage = () => {
  const maxPage = Math.ceil(pageInfo.total / pageInfo.pageSize) || 1;
  goToPage.value = Math.max(1, Math.min(goToPage.value, maxPage));
  pageInfo.currentPage = goToPage.value;
  fetchRoleLog();
};

// 导出日志
const exportLog = async () => {
  try {
    const params = {
      roleId: roleId.value,
      operator: searchForm.operator,
      operationType: searchForm.operationType,
      startTime: searchForm.operationTime[0] || '',
      endTime: searchForm.operationTime[1] || ''
    };
    const res = await exportRoleLog(params);

    // 处理文件下载
    const blob = res.data;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `角色${roleName.value}-权限变更日志.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    ElMessage.success('日志导出成功');
  } catch (error) {
    ElMessage.error('日志导出失败');
    console.error(error);
  }
};

// 页面挂载时初始化
onMounted(() => {
  if (!roleId.value) {
    ElMessage.warning('角色ID不存在');
    history.back(); // 返回上一页
    return;
  }
  fetchRoleLog();
});
</script>

<style scoped>
.role-log-container {
  background-color: #fff;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.export-btn {
  background-color: #2f54eb;
  border-color: #2f54eb;
}

/* 搜索栏样式复用角色列表页 */
.search-bar {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
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

/* 日志内容样式 */
.ellipsis-text {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-content {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  color: #333;
}

.log-content-popover {
  max-height: 400px;
  overflow-y: auto;
}

/* 分页样式复用角色列表页 */
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
  width: 80px;
}

.go-to-text {
  color: #666;
  font-size: 14px;
}

.go-to-input {
  width: 80px;
}
</style>