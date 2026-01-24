<template>
  <div class="role-list-container">
    <!-- 页面标题+新增按钮 -->
    <div class="page-header">
      <h3>角色管理</h3>
      <el-button type="primary" class="add-btn" @click="openRoleForm">新增角色</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input
              v-model="searchForm.roleName"
              placeholder="请输入角色名称"
              clearable
              class="search-input"
          />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select
              v-model="searchForm.status"
              placeholder="Select"
              clearable
              class="search-select"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="query-btn" @click="fetchRoleList">查询</el-button>
          <el-button class="reset-btn" @click="resetSearch">重置</el-button>
        </el-form-item>
        <!-- 拖拽上传按钮 -->
        <div class="upload-btn">
          <el-upload
              class="upload-dragger"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">拖拽至此上传</div>
          </el-upload>
        </div>
      </el-form>
    </div>

    <!-- 角色表格 -->
    <div class="table-container">
      <el-table
          :data="roleList"
          border
          stripe
          :loading="tableLoading"
          :empty-text="emptyText"
          class="role-table"
      >
        <el-table-column label="No" type="index" width="60" align="center" />
        <el-table-column label="角色名称" prop="roleName" align="center" />
        <el-table-column label="角色标识" prop="roleCode" align="center" />
        <el-table-column label="角色描述" prop="roleDesc" align="center" />
        <el-table-column label="创建时间" prop="createTime" align="center" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
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
        <el-table-column label="操作" align="center" width="220">
          <template #default="scope">
            <el-button type="text" @click="openRoleForm(scope.row)">编辑</el-button>
            <el-button type="text" @click="goToPermission(scope.row.id)">权限分配</el-button>
            <el-button type="text" @click="goToRoleLog(scope.row.id)">变更日志</el-button>
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

  <!-- 新增/编辑角色弹窗 -->
  <el-dialog
      :title="isEdit ? '编辑角色' : '新增角色'"
      v-model="isFormOpen"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
  >
    <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px" class="role-form">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色标识" prop="roleCode">
        <el-input v-model="roleForm.roleCode" placeholder="请输入角色标识（英文/数字）" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="roleForm.roleDesc" placeholder="请输入角色描述" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="角色状态" prop="status">
        <el-select v-model="roleForm.status" placeholder="请选择角色状态">
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="isFormOpen = false">取消</el-button>
      <el-button type="primary" @click="submitRoleForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
// 1. 导入所有必要依赖（完整）
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';

// 2. 模拟接口（如果真实接口未完成，先模拟避免报错）
// 替换为你的真实接口导入：import { getRoleList, addRole, editRole, updateRoleStatus, importRole } from '@/api/system/role';
// 临时模拟接口函数
const getRoleList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: [
            { id: '1', roleName: '系统管理员', roleCode: 'sys_admin', roleDesc: '系统最高权限', createTime: '2026-01-01 10:00:00', status: '1' },
            { id: '2', roleName: '院系管理员', roleCode: 'dept_admin', roleDesc: '管理院系数据', createTime: '2026-01-02 14:00:00', status: '1' },
            { id: '3', roleName: '活动负责人', roleCode: 'activity_host', roleDesc: '管理活动', createTime: '2026-01-03 09:00:00', status: '0' }
          ],
          total: 3
        }
      });
    }, 500);
  });
};
const addRole = (data) => Promise.resolve({ code: 200 });
const editRole = (data) => Promise.resolve({ code: 200 });
const updateRoleStatus = (data) => Promise.resolve({ code: 200 });
const importRole = (formData) => Promise.resolve({ code: 200 });

// 3. 定义所有模板中使用的变量（完整初始化）
const router = useRouter();

// 表格相关
const tableLoading = ref(false);
const roleList = ref([]);
const emptyText = ref('No Data');

// 搜索表单
const searchForm = reactive({
  roleName: '',
  status: ''
});

// 分页信息（完整初始化，避免total undefined）
const pageInfo = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});
const goToPage = ref(1);

// 弹窗相关
const isFormOpen = ref(false);
const isEdit = ref(false);
const roleFormRef = ref(null);
const roleForm = reactive({
  id: '',
  roleName: '',
  roleCode: '',
  roleDesc: '',
  status: '1'
});

// 表单校验规则
const roleRules = reactive({
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色标识仅支持英文、数字、下划线', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择角色状态', trigger: 'change' }]
});

// 4. 定义所有模板中使用的方法（完整）
// 日期格式化
const formatDate = (date) => {
  return date ? format(new Date(date), 'yyyy-MM-dd HH:mm:ss') : '';
};

// 获取角色列表
const fetchRoleList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      roleName: searchForm.roleName,
      status: searchForm.status
    };
    const res = await getRoleList(params);
    if (res.code === 200) {
      roleList.value = res.data.list;
      pageInfo.total = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取角色列表失败');
    }
  } catch (error) {
    ElMessage.error('获取角色列表异常');
    console.error(error);
  } finally {
    tableLoading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.roleName = '';
  searchForm.status = '';
  pageInfo.currentPage = 1;
  goToPage.value = 1;
  fetchRoleList();
};

// 分页大小变更
const handleSizeChange = (size) => {
  pageInfo.pageSize = size;
  fetchRoleList();
};

// 当前页变更
const handleCurrentChange = (page) => {
  pageInfo.currentPage = page;
  goToPage.value = page;
  fetchRoleList();
};

// 跳转指定页码
const handleGoToPage = () => {
  const maxPage = Math.ceil(pageInfo.total / pageInfo.pageSize) || 1;
  goToPage.value = Math.max(1, Math.min(goToPage.value, maxPage));
  pageInfo.currentPage = goToPage.value;
  fetchRoleList();
};

// 打开新增/编辑弹窗
const openRoleForm = (row = null) => {
  if (row) {
    // 编辑模式
    isEdit.value = true;
    roleForm.id = row.id;
    roleForm.roleName = row.roleName;
    roleForm.roleCode = row.roleCode;
    roleForm.roleDesc = row.roleDesc;
    roleForm.status = row.status;
  } else {
    // 新增模式
    isEdit.value = false;
    if (roleFormRef.value) {
      roleFormRef.value.resetFields();
    }
    Object.assign(roleForm, { id: '', roleName: '', roleCode: '', roleDesc: '', status: '1' });
  }
  isFormOpen.value = true;
};

// 提交角色表单
const submitRoleForm = async () => {
  try {
    if (!roleFormRef.value) return;
    await roleFormRef.value.validate();

    let res;
    if (isEdit.value) {
      res = await editRole(roleForm);
    } else {
      res = await addRole(roleForm);
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '角色编辑成功' : '角色新增成功');
      isFormOpen.value = false;
      fetchRoleList();
    } else {
      ElMessage.error(res.msg || (isEdit.value ? '角色编辑失败' : '角色新增失败'));
    }
  } catch (error) {
    ElMessage.error('表单校验失败，请检查输入');
    console.error(error);
  }
};

// 角色状态变更
const handleStatusChange = async (row) => {
  const statusText = row.status === '1' ? '启用' : '禁用';
  try {
    await ElMessageBox.confirm(
        `确定要${statusText}该角色吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    const res = await updateRoleStatus({ id: row.id, status: row.status });
    if (res.code === 200) {
      ElMessage.success(`角色${statusText}成功`);
    } else {
      ElMessage.error(`角色${statusText}失败`);
      // 回滚状态
      row.status = row.status === '1' ? '0' : '1';
    }
  } catch (error) {
    // 取消操作，回滚状态
    row.status = row.status === '1' ? '0' : '1';
    if (error.message !== 'cancel') {
      ElMessage.error(`角色${statusText}异常`);
    }
  }
};

// 跳转到权限分配
const goToPermission = (roleId) => {
  router.push(`/admin/system/role/permission/${roleId}`);
};

// 跳转到变更日志
const goToRoleLog = (roleId) => {
  router.push(`/admin/system/role/log/${roleId}`);
};

// 批量导入角色
const handleFileChange = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file.raw);
    const res = await importRole(formData);
    if (res.code === 200) {
      ElMessage.success('角色批量导入成功');
      fetchRoleList();
    } else {
      ElMessage.error(res.msg || '角色批量导入失败');
    }
  } catch (error) {
    ElMessage.error('角色批量导入异常');
    console.error(error);
  }
};

// 5. 页面挂载时初始化数据
onMounted(() => {
  fetchRoleList();
});
</script>

<style scoped>
/* 基础布局样式 */
.role-list-container {
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

/* 搜索栏样式 */
.search-bar {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
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

.upload-btn {
  margin-left: auto;
}

/* 表格容器样式 */
.table-container {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.role-table {
  width: 100%;
  --el-table-row-hover-bg-color: #f5f7fa;
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
  width: 80px;
}

.go-to-text {
  color: #666;
  font-size: 14px;
}

.go-to-input {
  width: 80px;
}

/* 表单样式 */
.role-form {
  margin-top: 20px;
}
</style>