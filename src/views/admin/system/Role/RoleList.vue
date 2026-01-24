<template>
  <div class="role-list-container">
    <div class="page-header">
      <h3>角色管理</h3>
      <el-button type="primary" @click="openRoleForm">新增角色</el-button>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select v-model="searchForm.status" placeholder="请选择角色状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchRoleList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="roleList" border stripe :loading="tableLoading">
        <el-table-column label="序号" type="index" width="60" align="center" />
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
            <el-button type="text" @click="goToRoleLog(scope.row.id)">修改日志</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageInfo.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageInfo.pageSize"
          :total="pageInfo.total"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
      />
    </el-card>
  </div>

  <el-dialog
      :title="isEdit ? '编辑角色' : '新增角色'"
      v-model="isFormOpen"
      width="500px"
      append-to-body
  >
    <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色标识" prop="roleCode">
        <el-input v-model="roleForm.roleCode" placeholder="请输入角色标识(英文/数字)" :disabled="isEdit" />
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
// 引入角色相关接口（后续创建）
import { getRoleList, addRole, editRole, updateRoleStatus } from '@/api/system/role';

const router = useRouter();

// 表格加载状态
const tableLoading = ref(false);
// 角色列表数据
const roleList = ref([]);
// 搜索表单
const searchForm = reactive({
  roleName: '',
  status: ''
});
// 分页信息
const pageInfo = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 新增/编辑表单
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

// 日期格式化
const formatDate = (date) => {
  return date ? format(new Date(date), 'yyyy-MM-dd HH:mm:ss') : '';
};

// 获取角色列表（对接接口）
const fetchRoleList = async () => {
  try {
    tableLoading.value = true;
    // 构造请求参数（分页 + 搜索条件）
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
  fetchRoleList();
};

// 打开新增/编辑表单
const openRoleForm = (row = null) => {
  if (row) {
    // 编辑模式：赋值表单数据
    isEdit.value = true;
    roleForm.id = row.id;
    roleForm.roleName = row.roleName;
    roleForm.roleCode = row.roleCode;
    roleForm.roleDesc = row.roleDesc;
    roleForm.status = row.status;
  } else {
    // 新增模式：重置表单
    isEdit.value = false;
    if (roleFormRef.value) {
      roleFormRef.value.resetFields();
    }
    roleForm.id = '';
    roleForm.status = '1';
  }
  isFormOpen.value = true;
};

// 提交角色表单（新增/编辑）
const submitRoleForm = async () => {
  try {
    await roleFormRef.value.validate();
    let res;
    if (isEdit.value) {
      // 编辑角色
      res = await editRole(roleForm);
    } else {
      // 新增角色
      res = await addRole(roleForm);
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '角色编辑成功' : '角色新增成功');
      isFormOpen.value = false;
      fetchRoleList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || (isEdit.value ? '角色编辑失败' : '角色新增失败'));
    }
  } catch (error) {
    ElMessage.error('表单校验失败，请检查输入');
    console.error(error);
  }
};

// 角色状态变更（启用/禁用）
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
    // 调用接口更新状态
    const res = await updateRoleStatus({
      id: row.id,
      status: row.status
    });
    if (res.code === 200) {
      ElMessage.success(`角色${statusText}成功`);
    } else {
      ElMessage.error(`角色${statusText}失败`);
      // 接口失败回滚状态
      row.status = row.status === '1' ? '0' : '1';
    }
  } catch (error) {
    // 取消操作回滚状态
    row.status = row.status === '1' ? '0' : '1';
    if (error.message !== 'cancel') {
      ElMessage.error(`角色${statusText}异常`);
      console.error(error);
    }
  }
};

// 跳转到权限分配页面
const goToPermission = (roleId) => {
  router.push(`/admin/system/role/permission/${roleId}`);
};

// 跳转到角色修改日志
const goToRoleLog = (roleId) => {
  router.push(`/admin/system/role/log/${roleId}`);
};

// 页面挂载时初始化角色列表
onMounted(() => {
  fetchRoleList();
});
</script>

<style scoped>
.role-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-card {
  padding: 16px;
}

.table-card {
  padding: 0;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>