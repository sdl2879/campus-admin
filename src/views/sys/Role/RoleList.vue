<template>
  <div class="role-list-container">
    <!-- 筛选栏 -->
    <div class="search-bar">
      <el-input v-model="searchName" placeholder="请输入角色名称" style="width: 200px; margin-right: 10px;"></el-input>
      <el-button type="primary" @click="getRoleList">查询</el-button>
      <el-button type="success" @click="openAddRole">新增角色</el-button>
    </div>

    <!-- 角色列表 -->
    <el-table :data="roleList" border stripe style="margin-top: 10px;">
      <el-table-column prop="id" label="角色ID" width="80"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="roleCode" label="角色编码"></el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editRole(scope.row)">编辑</el-button>
          <el-button size="small" type="warning" @click="changeStatus(scope.row)">
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" text @click="openPermissionAssign(scope.row.id)">权限分配</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 10px; text-align: right;"
    />

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog v-model="dialogVisible" title="角色表单" width="400px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model="roleForm.roleCode" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="roleForm.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRole">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限分配弹窗 -->
    <RolePermissionAssign
        :role-id="currentRoleId"
        :visible="assignDialogVisible"
        @update:visible="assignDialogVisible = $event"
        @refresh-role-list="getRoleList"
    />
  </div>
</template>

<script setup>

import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getRolePage } from '@/api/sys/role';
import RolePermissionAssign from './RolePermissionAssign.vue';

// 分页与数据
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const roleList = ref([]);
const searchName = ref('');

// 弹窗控制
const dialogVisible = ref(false);
const isEdit = ref(false);
const roleForm = reactive({
  id: '',
  roleName: '',
  roleCode: '',
  remark: ''
});

// 权限分配
const assignDialogVisible = ref(false);
const currentRoleId = ref(0); // ✅ 初始化为 0（Number 类型）

// 初始化加载
onMounted(() => {
  getRoleList();
});

// 获取角色列表
const getRoleList = async () => {
  try {
    const res = await getRolePage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      roleName: searchName.value?.trim() || undefined
    });

    if (res.code === 200) {
      roleList.value = res.data?.records || []; // 注意：分页数据在 res.data.records
      total.value = res.data?.total || 0;
    } else {
      ElMessage.error(res.msg || '获取角色列表失败');
      roleList.value = [];
      total.value = 0;
    }
  } catch (e) {
    console.error('请求异常:', e);
    ElMessage.error('网络错误，请检查后端服务是否启动');
    roleList.value = [];
    total.value = 0;
  }
};

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val;
  getRoleList();
};
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getRoleList();
};

// 新增角色
const openAddRole = () => {
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(roleForm, { id: '', roleName: '', roleCode: '', remark: '' });
};

// 编辑角色
const editRole = (row) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(roleForm, { ...row });
};

// 提交表单
const submitRole = async () => {
  if (!roleForm.roleName) return ElMessage.warning('角色名称不能为空');
  if (!roleForm.roleCode && !isEdit.value) return ElMessage.warning('角色编码不能为空');

  try {
    const res = isEdit.value
        ? await request.put('/sys/role/update', roleForm)
        : await request.post('/sys/role/add', roleForm);

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功');
      dialogVisible.value = false;
      getRoleList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '操作失败');
  }
};

// 启用/禁用
const changeStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要${row.status === 1 ? '禁用' : '启用'}该角色吗？`,
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    const res = await request.post('/sys/role/changeStatus', {
      id: row.id,
      status: row.status === 1 ? 0 : 1
    });

    if (res.code === 200) {
      ElMessage.success(`角色${row.status === 1 ? '禁用' : '启用'}成功`);
      getRoleList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (e) {
    if (e.name !== 'Cancel') ElMessage.error('操作已取消');
  }
};

// 打开权限分配
const openPermissionAssign = (roleId) => {
  if (!roleId || roleId <= 0) return ElMessage.warning('无效的角色ID');
  currentRoleId.value = roleId;
  assignDialogVisible.value = true;
};
</script>

<style scoped>
.role-list-container {
  padding: 20px;
}
.search-bar {
  margin-bottom: 10px;
}
</style>