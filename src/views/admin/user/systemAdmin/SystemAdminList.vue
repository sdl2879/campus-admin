<template>
  <div class="system-admin-container">
    <div class="page-header">
      <h3>系统管理员管理</h3>
      <el-button type="primary" class="add-btn" @click="openAdminForm">新增管理员</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="管理员账号">
          <el-input v-model="searchForm.username" placeholder="请输入管理员账号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="Select" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
              v-model="searchForm.createTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="query-btn" @click="fetchAdminList">查询</el-button>
          <el-button class="reset-btn" @click="resetSearch">重置</el-button>
        </el-form-item>
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

    <!-- 管理员表格 -->
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
        <el-table-column label="姓名" prop="realName" align="center" />
        <el-table-column label="手机号" prop="phone" align="center" />
        <el-table-column label="角色" prop="roleName" align="center" />
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
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button type="text" @click="openAdminForm(scope.row)">编辑</el-button>
            <el-button type="text" @click="resetPassword(scope.row.id)">重置密码</el-button>
            <el-button type="text" @click="assignRole(scope.row.id)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页（与角色管理一致） -->
      <div class="pagination-bar" v-if="pageInfo.total > 0">
        <span class="total-text">Total {{ pageInfo.total }}</span>
        <el-select v-model="pageInfo.pageSize" @change="handleSizeChange">
          <el-option label="10" value="10" />
          <el-option label="20" value="20" />
        </el-select>
        <el-pagination
            @current-change="handleCurrentChange"
            :current-page="pageInfo.currentPage"
            :page-size="pageInfo.pageSize"
            :total="pageInfo.total"
            layout="prev, pager, next"
        />
        <span class="go-to-text">Go to</span>
        <el-input
            v-model="goToPage"
            type="number"
            @change="handleGoToPage"
            class="go-to-input"
        />
      </div>
    </div>
  </div>

  <!-- 新增/编辑管理员弹窗 -->
  <el-dialog
      :title="isEdit ? '编辑管理员' : '新增管理员'"
      :visible.sync="isFormOpen"
      width="500px"
  >
    <el-form :model="adminForm" :rules="adminRules" ref="adminFormRef" label-width="100px">
      <el-form-item label="管理员账号" prop="username" :disabled="isEdit">
        <el-input v-model="adminForm.username" placeholder="请输入管理员账号" />
      </el-form-item>
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="adminForm.realName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <el-select v-model="adminForm.roleId" placeholder="请选择角色">
          <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="adminForm.status" placeholder="请选择状态">
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
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { getSystemAdminList, addSystemAdmin, editSystemAdmin, updateAdminStatus, resetAdminPassword, importSystemAdmin, getRoleAll } from '@/api/user/systemAdmin';

const router = useRouter();

// 表格数据
const adminList = ref([]);
const tableLoading = ref(false);
const emptyText = ref('No Data');

// 搜索表单
const searchForm = reactive({
  username: '',
  status: '',
  createTime: []
});

// 分页信息
const pageInfo = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});
const goToPage = ref(1);

// 角色列表（用于下拉选择）
const roleList = ref([]);

// 表单数据
const isFormOpen = ref(false);
const isEdit = ref(false);
const adminFormRef = ref(null);
const adminForm = reactive({
  id: '',
  username: '',
  realName: '',
  phone: '',
  roleId: '',
  status: '1'
});
const adminRules = reactive({
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 获取角色列表（用于下拉选择）
const fetchRoleAll = async () => {
  try {
    const res = await getRoleAll();
    if (res.code === 200) {
      roleList.value = res.data;
    }
  } catch (error) {
    console.error('获取角色列表失败：', error);
  }
};

// 获取系统管理员列表
const fetchAdminList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      username: searchForm.username,
      status: searchForm.status,
      startTime: searchForm.createTime[0]?.format('YYYY-MM-DD') || '',
      endTime: searchForm.createTime[1]?.format('YYYY-MM-DD') || ''
    };
    const res = await getSystemAdminList(params);
    if (res.code === 200) {
      adminList.value = res.data.list;
      pageInfo.total = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取管理员列表失败');
    }
  } catch (error) {
    ElMessage.error('获取管理员列表异常');
  } finally {
    tableLoading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, { username: '', status: '', createTime: [] });
  pageInfo.currentPage = 1;
  fetchAdminList();
};

// 分页/跳转逻辑（与角色管理一致）
const handleSizeChange = (size) => { /* ... */ };
const handleCurrentChange = (page) => { /* ... */ };
const handleGoToPage = () => { /* ... */ };

// 新增/编辑弹窗逻辑
const openAdminForm = (row = null) => { /* ... */ };
const submitAdminForm = async () => { /* ... */ };

// 状态变更/重置密码/分配角色
const handleStatusChange = async (row) => { /* ... */ };
const resetPassword = async (id) => { /* ... */ };
const assignRole = (id) => { router.push(`/admin/user/systemAdmin/assignRole/${id}`); };

// 批量导入
const handleFileChange = async (file) => { /* ... */ };

// 初始化
onMounted(() => {
  fetchRoleAll();
  fetchAdminList();
});
</script>

<style scoped>
/* 与角色管理页面样式一致，复用即可 */
.system-admin-container {
  background-color: #fff;
  padding: 20px;
  min-height: calc(100vh - 60px);
}
/* 其他样式复用.role-list-container的.search-bar、.table-container等 */
</style>