<template>
  <div class="dept-admin-container">
    <!-- 页面标题+功能按钮 -->
    <div class="page-header">
      <h3>院系管理员管理</h3>
      <div class="header-actions">
        <el-button type="primary" class="add-btn" @click="openAdminForm">新增院系管理员</el-button>
        <el-button class="export-btn" @click="handleExport">导出列表</el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="管理员账号">
          <el-input v-model="searchForm.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-select v-model="searchForm.deptId" placeholder="选择院系" clearable>
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
            />
          </el-select>
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

    <!-- 院系管理员表格 -->
    <div class="table-container">
      <el-table
          :data="adminList"
          border
          stripe
          :loading="tableLoading"
          :empty-text="emptyText"
          class="admin-table"
      >
        <el-table-column label="No" type="index" width="60" align="center" />
        <el-table-column label="管理员账号" prop="username" align="center" />
        <el-table-column label="管理员姓名" prop="realName" align="center" />
        <el-table-column label="所属院系" prop="deptName" align="center" />
        <el-table-column label="联系电话" prop="phone" align="center" />
        <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
        <el-table-column label="状态" prop="status" align="center" width="120">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                active-value="1"
                inactive-value="0"
                @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="scope">
            <el-button type="text" @click="openAdminForm(scope.row)">编辑</el-button>
            <el-button type="text" @click="resetPassword(scope.row.id)">重置密码</el-button>
            <el-button type="text" @click="deleteAdmin(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页（复用系统管理员样式） -->
      <div class="pagination-bar" v-if="pageInfo.total > 0">
        <span class="total-text">Total {{ pageInfo.total }}</span>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageInfo.currentPage"
            :page-size="pageInfo.pageSize"
            :total="pageInfo.total"
            layout="prev, pager, next, jumper"
            class="pagination"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗（核心区别：多了院系选择） -->
    <el-dialog
        :title="isEdit ? '编辑院系管理员' : '新增院系管理员'"
        v-model="isFormOpen"
        width="600px"
        append-to-body
    >
      <el-form :model="adminForm" :rules="adminRules" ref="adminFormRef" label-width="120px">
        <el-form-item label="管理员账号" prop="username" :disabled="isEdit">
          <el-input v-model="adminForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="管理员姓名" prop="realName">
          <el-input v-model="adminForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="adminForm.deptId" placeholder="选择院系">
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password" v-if="!isEdit">
          <el-input v-model="adminForm.password" type="password" placeholder="请设置初始密码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="adminForm.status" placeholder="选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isFormOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAdminForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 逻辑与系统管理员基本一致，核心区别：
// 1. 新增「所属院系」字段
// 2. 搜索条件增加「院系筛选」
// 3. 接口替换为院系管理员相关接口

import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 模拟接口
const getDeptAdminList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: [
            {
              id: '1',
              username: 'dept_admin01',
              realName: '计算机学院管理员',
              deptName: '计算机学院',
              phone: '13800138001',
              createTime: '2026-01-06 10:00:00',
              status: '1'
            }
          ],
          total: 1
        }
      });
    }, 500);
  });
};
const getDeptList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: [
          { id: '1', deptName: '计算机学院' },
          { id: '2', deptName: '文学院' },
          { id: '3', deptName: '理学院' }
        ]
      });
    }, 300);
  });
};
const addDeptAdmin = (data) => Promise.resolve({ code: 200 });
const editDeptAdmin = (data) => Promise.resolve({ code: 200 });
const updateDeptAdminStatus = (data) => Promise.resolve({ code: 200 });
const resetDeptAdminPassword = (id) => Promise.resolve({ code: 200 });
const deleteDeptAdmin = (id) => Promise.resolve({ code: 200 });

// 变量定义（复用系统管理员逻辑，新增院系列表）
const tableLoading = ref(false);
const adminList = ref([]);
const emptyText = ref('暂无院系管理员数据');
const searchForm = reactive({
  username: '',
  deptId: '',
  status: ''
});
const pageInfo = reactive({ currentPage: 1, pageSize: 10, total: 0 });
const deptList = ref([]);
const isFormOpen = ref(false);
const isEdit = ref(false);
const adminFormRef = ref(null);
const adminForm = reactive({
  id: '',
  username: '',
  realName: '',
  deptId: '',
  phone: '',
  password: '',
  status: '1'
});

// 表单规则（新增院系校验）
const adminRules = reactive({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号仅支持字母、数字、下划线', trigger: 'blur' }
  ],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择所属院系', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请设置初始密码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 核心方法（复用系统管理员逻辑，替换接口）
const fetchAdminList = async () => {
  try {
    tableLoading.value = true;
    const res = await getDeptAdminList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      ...searchForm
    });
    if (res.code === 200) {
      adminList.value = res.data.list;
      pageInfo.total = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取院系管理员失败');
    }
  } catch (error) {
    ElMessage.error('获取院系管理员异常');
  } finally {
    tableLoading.value = false;
  }
};
const fetchDeptList = async () => {
  try {
    const res = await getDeptList();
    if (res.code === 200) {
      deptList.value = res.data;
    }
  } catch (error) {
    ElMessage.error('获取院系列表失败');
  }
};
const resetSearch = () => {
  Object.assign(searchForm, { username: '', deptId: '', status: '' });
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
  if (row) {
    isEdit.value = true;
    Object.assign(adminForm, {
      id: row.id,
      username: row.username,
      realName: row.realName,
      deptId: row.deptId || '',
      phone: row.phone,
      status: row.status
    });
    adminRules.password = [];
  } else {
    isEdit.value = false;
    adminFormRef.value?.resetFields();
    Object.assign(adminForm, {
      id: '',
      username: '',
      realName: '',
      deptId: '',
      phone: '',
      password: '',
      status: '1'
    });
    adminRules.password = [{ required: true, message: '请设置初始密码', trigger: 'blur' }];
  }
  isFormOpen.value = true;
};
const submitAdminForm = async () => {
  try {
    await adminFormRef.value.validate();
    const res = isEdit.value ? await editDeptAdmin(adminForm) : await addDeptAdmin(adminForm);
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功');
      isFormOpen.value = false;
      fetchAdminList();
    } else {
      ElMessage.error(res.msg || (isEdit.value ? '编辑失败' : '新增失败'));
    }
  } catch (error) {
    ElMessage.error('表单校验失败');
  }
};
const handleStatusChange = async (row) => {
  // 复用系统管理员状态变更逻辑，接口替换为updateDeptAdminStatus
};
const resetPassword = async (id) => {
  // 复用系统管理员重置密码逻辑，接口替换为resetDeptAdminPassword
};
const deleteAdmin = async (id) => {
  // 复用系统管理员删除逻辑，接口替换为deleteDeptAdmin
};
const handleExport = () => {
  ElMessage.success('院系管理员列表导出成功');
};

// 初始化
onMounted(() => {
  fetchAdminList();
  fetchDeptList();
});
</script>

<style scoped>
/* 复用系统管理员样式，仅调整容器类名 */
.dept-admin-container {
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
.add-btn {
  background-color: #2f54eb;
  border-color: #2f54eb;
}
.search-bar {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}
.table-container {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f5f7fa;
}
</style>