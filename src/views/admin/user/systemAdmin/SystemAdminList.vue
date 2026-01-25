<template>
  <div class="system-admin-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h3>系统管理员管理</h3>
      <el-button type="primary" @click="openAdminForm">新增管理员</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="管理员账号">
          <el-input v-model="searchForm.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="管理员姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchAdminList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
          :data="adminList"
          border
          stripe
          :loading="tableLoading"
          :empty-text="emptyText"
      >
        <el-table-column label="No" type="index" width="60" align="center" />
        <el-table-column label="管理员账号" prop="username" align="center" />
        <el-table-column label="管理员姓名" prop="realName" align="center" />
        <el-table-column label="联系电话" prop="phone" align="center" />
        <el-table-column label="所属角色" prop="roleNames" align="center">
          <template #default="scope">
            <el-tag
                v-for="roleName in scope.row.roleNames"
                :key="roleName"
                type="info"
                size="small"
            >
              {{ roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
        <el-table-column label="操作" align="center" width="220">
          <template #default="scope">
            <el-button type="text" @click="openAdminForm(scope.row)">编辑</el-button>
            <el-button
                type="text"
                :type="scope.row.status === '1' ? 'warning' : 'success'"
                @click="changeStatus(scope.row.id, scope.row.status)"
            >
              {{ scope.row.status === '1' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="text" @click="resetPassword(scope.row.id)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar" v-if="pageInfo.total > 0">
        <span class="total-text">Total {{ pageInfo.total }}</span>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageInfo.currentPage"
            :page-size="pageInfo.pageSize"
            :total="pageInfo.total"
            layout="prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        :title="isEdit ? '编辑系统管理员' : '新增系统管理员'"
        v-model="isFormOpen"
        width="600px"
        append-to-body
        :close-on-click-modal="false"
    >
      <!-- 引用独立的表单组件 -->
      <SystemAdminForm
          ref="formComponent"
          :is-edit="isEdit"
          :role-list="roleList"
          :initial-data="adminForm"
          @submit="onFormSubmit"
      />
      <template #footer>
        <el-button @click="isFormOpen = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 导入独立表单组件
import SystemAdminForm from './SystemAdminForm.vue';

// 模拟接口
const getSystemAdminList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: [
            {
              id: '1',
              username: 'admin',
              realName: '系统管理员',
              phone: '13800138000',
              roleIds: ['1'],
              roleNames: ['超级管理员'],
              status: '1',
              createTime: '2026-01-01 10:00:00'
            },
            {
              id: '2',
              username: 'operator',
              realName: '运营管理员',
              phone: '13900139000',
              roleIds: ['2'],
              roleNames: ['运营角色'],
              status: '1',
              createTime: '2026-01-02 10:00:00'
            }
          ],
          total: 2
        }
      });
    }, 500);
  });
};

const getRoleList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: [
          { id: '1', roleName: '超级管理员' },
          { id: '2', roleName: '运营角色' },
          { id: '3', roleName: '审计角色' }
        ]
      });
    }, 300);
  });
};

const addSystemAdmin = (data) => Promise.resolve({ code: 200 });
const editSystemAdmin = (data) => Promise.resolve({ code: 200 });
const changeAdminStatus = (id, status) => Promise.resolve({ code: 200 });
const resetAdminPassword = (id) => Promise.resolve({ code: 200 });

// 状态管理
const tableLoading = ref(false);
const adminList = ref([]);
const emptyText = ref('暂无系统管理员数据');
const searchForm = reactive({
  username: '',
  realName: '',
  status: ''
});
const pageInfo = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});
const roleList = ref([]);
const isFormOpen = ref(false);
const isEdit = ref(false);
const adminForm = ref({}); // 表单初始数据
const formComponent = ref(null); // 表单组件引用

// 核心方法
const fetchAdminList = async () => {
  try {
    tableLoading.value = true;
    const res = await getSystemAdminList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      ...searchForm
    });
    if (res.code === 200) {
      adminList.value = res.data.list;
      pageInfo.total = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取管理员列表失败');
    }
  } catch (error) {
    ElMessage.error('获取管理员列表异常');
    console.error(error);
  } finally {
    tableLoading.value = false;
  }
};

const fetchRoleList = async () => {
  try {
    const res = await getRoleList();
    if (res.code === 200) {
      roleList.value = res.data;
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
  }
};

const resetSearch = () => {
  Object.assign(searchForm, { username: '', realName: '', status: '' });
  pageInfo.currentPage = 1;
  fetchAdminList();
};

const handleSizeChange = (size) => {
  pageInfo.pageSize = size;
  fetchAdminList();
};

const handleCurrentChange = (page) => {
  pageInfo.currentPage = page;
  fetchAdminList();
};

const openAdminForm = (row = null) => {
  isEdit.value = !!row;
  // 编辑模式：赋值初始数据；新增模式：清空数据
  adminForm.value = row ? { ...row } : {};
  isFormOpen.value = true;
};

// 提交表单（调用子组件的提交方法）
const submitForm = async () => {
  if (!formComponent.value) return;
  await formComponent.value.handleSubmit();
};

// 接收子组件的提交事件
const onFormSubmit = async (formData) => {
  try {
    let res;
    if (isEdit.value) {
      res = await editSystemAdmin(formData);
    } else {
      res = await addSystemAdmin(formData);
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '管理员编辑成功' : '管理员新增成功');
      isFormOpen.value = false;
      fetchAdminList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || (isEdit.value ? '管理员编辑失败' : '管理员新增失败'));
    }
  } catch (error) {
    ElMessage.error('操作异常，请稍后重试');
    console.error(error);
  }
};

// 切换管理员状态
const changeStatus = async (id, status) => {
  try {
    await ElMessageBox.confirm(
        `确定要${status === '1' ? '禁用' : '启用'}该管理员吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: status === '1' ? 'warning' : 'info'
        }
    );

    const res = await changeAdminStatus(id, status === '1' ? '0' : '1');
    if (res.code === 200) {
      ElMessage.success(`管理员${status === '1' ? '禁用' : '启用'}成功`);
      fetchAdminList();
    } else {
      ElMessage.error(res.msg || `管理员${status === '1' ? '禁用' : '启用'}失败`);
    }
  } catch (error) {
    if (error.message !== 'cancel') {
      ElMessage.error(`管理员${status === '1' ? '禁用' : '启用'}异常`);
    }
  }
};

// 重置密码
const resetPassword = async (id) => {
  try {
    await ElMessageBox.confirm(
        '确定要重置该管理员的密码吗？默认密码为123456',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    const res = await resetAdminPassword(id);
    if (res.code === 200) {
      ElMessage.success('密码重置成功，默认密码：123456');
    } else {
      ElMessage.error(res.msg || '密码重置失败');
    }
  } catch (error) {
    if (error.message !== 'cancel') {
      ElMessage.error('密码重置异常');
    }
  }
};

// 初始化
onMounted(() => {
  fetchAdminList();
  fetchRoleList();
});
</script>

<style scoped>
/* 基础布局 */
.system-admin-container {
  background-color: #fff;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

/* 搜索栏 */
.search-bar {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

/* 表格容器 */
.table-container {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

/* 分页样式 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f5f7fa;
}

.total-text {
  color: #666;
  font-size: 14px;
}

/* 标签样式优化 */
:deep(.el-tag) {
  margin: 0 2px;
}
</style>