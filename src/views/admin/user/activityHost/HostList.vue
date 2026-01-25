<template>
  <div class="host-container">
    <div class="page-header">
      <h3>活动负责人管理</h3>
      <el-button type="primary" @click="openHostForm">新增负责人</el-button>
    </div>

    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="负责人姓名">
          <el-input v-model="searchForm.hostName" placeholder="请输入姓名" clearable />
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
        <el-form-item label="负责活动类型">
          <el-select v-model="searchForm.activityType" placeholder="选择类型" clearable>
            <el-option label="志愿服务" value="VOLUNTEER" />
            <el-option label="学术讲座" value="LECTURE" />
            <el-option label="文体活动" value="CULTURAL" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchHostList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table
          :data="hostList"
          border
          stripe
          :loading="tableLoading"
          :empty-text="emptyText"
      >
        <el-table-column label="No" type="index" width="60" align="center" />
        <el-table-column label="负责人姓名" prop="hostName" align="center" />
        <el-table-column label="所属院系" prop="deptName" align="center" />
        <el-table-column label="联系电话" prop="phone" align="center" />
        <el-table-column label="负责活动类型" prop="activityType" align="center">
          <template #default="scope">
            <el-tag>{{ getActivityTypeName(scope.row.activityType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责活动数" prop="activityCount" align="center" />
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
            <el-button type="text" @click="openHostForm(scope.row)">编辑</el-button>
            <el-button type="text" @click="viewActivity(scope.row.id)">查看负责活动</el-button>
            <el-button type="text" @click="deleteHost(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar" v-if="pageInfo.total > 0">
        <span class="total-text">Total {{ pageInfo.total }}</span>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageInfo.currentPage"
            :page-size="pageInfo.pageSize"
            :total="pageInfo.total"
            layout="prev, pager, next"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        :title="isEdit ? '编辑活动负责人' : '新增活动负责人'"
        v-model="isFormOpen"
        width="600px"
    >
      <el-form :model="hostForm" :rules="hostRules" ref="hostFormRef" label-width="120px">
        <el-form-item label="负责人姓名" prop="hostName">
          <el-input v-model="hostForm.hostName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="hostForm.deptId" placeholder="选择院系">
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="hostForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="负责活动类型" prop="activityType">
          <el-select v-model="hostForm.activityType" placeholder="选择活动类型">
            <el-option label="志愿服务" value="VOLUNTEER" />
            <el-option label="学术讲座" value="LECTURE" />
            <el-option label="文体活动" value="CULTURAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="hostForm.status" placeholder="选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isFormOpen = false">取消</el-button>
        <el-button type="primary" @click="submitHostForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();

// 活动类型映射
const activityTypeMap = ref({
  VOLUNTEER: '志愿服务',
  LECTURE: '学术讲座',
  CULTURAL: '文体活动'
});

// 模拟接口
const getHostList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: [
            {
              id: '1',
              hostName: '张三',
              deptName: '计算机学院',
              phone: '13800138002',
              activityType: 'VOLUNTEER',
              activityCount: 5,
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
          { id: '2', deptName: '文学院' }
        ]
      });
    }, 300);
  });
};
const addHost = (data) => Promise.resolve({ code: 200 });
const editHost = (data) => Promise.resolve({ code: 200 });
const updateHostStatus = (data) => Promise.resolve({ code: 200 });
const deleteHostApi = (id) => Promise.resolve({ code: 200 });

// 变量定义
const tableLoading = ref(false);
const hostList = ref([]);
const emptyText = ref('暂无活动负责人数据');
const searchForm = reactive({
  hostName: '',
  deptId: '',
  activityType: ''
});
const pageInfo = reactive({ currentPage: 1, pageSize: 10, total: 0 });
const deptList = ref([]);
const isFormOpen = ref(false);
const isEdit = ref(false);
const hostFormRef = ref(null);
const hostForm = reactive({
  id: '',
  hostName: '',
  deptId: '',
  phone: '',
  activityType: '',
  status: '1'
});

// 表单规则
const hostRules = reactive({
  hostName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择院系', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  activityType: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 核心方法
const getActivityTypeName = (type) => {
  return activityTypeMap.value[type] || type;
};
const fetchHostList = async () => {
  try {
    tableLoading.value = true;
    const res = await getHostList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      ...searchForm
    });
    if (res.code === 200) {
      hostList.value = res.data.list;
      pageInfo.total = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取负责人列表失败');
    }
  } catch (error) {
    ElMessage.error('获取负责人列表异常');
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
  Object.assign(searchForm, { hostName: '', deptId: '', activityType: '' });
  pageInfo.currentPage = 1;
  fetchHostList();
};
const handleSizeChange = (size) => {
  pageInfo.pageSize = size;
  fetchHostList();
};
const handleCurrentChange = (page) => {
  pageInfo.currentPage = page;
  fetchHostList();
};
const openHostForm = (row = null) => {
  if (row) {
    isEdit.value = true;
    Object.assign(hostForm, {
      id: row.id,
      hostName: row.hostName,
      deptId: row.deptId || '',
      phone: row.phone,
      activityType: row.activityType,
      status: row.status
    });
  } else {
    isEdit.value = false;
    hostFormRef.value?.resetFields();
    Object.assign(hostForm, {
      id: '',
      hostName: '',
      deptId: '',
      phone: '',
      activityType: '',
      status: '1'
    });
  }
  isFormOpen.value = true;
};
const submitHostForm = async () => {
  try {
    await hostFormRef.value.validate();
    const res = isEdit.value ? await editHost(hostForm) : await addHost(hostForm);
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功');
      isFormOpen.value = false;
      fetchHostList();
    } else {
      ElMessage.error(res.msg || (isEdit.value ? '编辑失败' : '新增失败'));
    }
  } catch (error) {
    ElMessage.error('表单校验失败');
  }
};
const handleStatusChange = async (row) => {
  // 状态变更逻辑
};
const viewActivity = (id) => {
  // 跳转到该负责人的活动列表
  router.push(`/admin/activity/manage/list?hostId=${id}`);
};
const deleteHost = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该负责人吗？', '提示', { type: 'danger' });
    const res = await deleteHostApi(id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      fetchHostList();
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error) {
    if (error.message !== 'cancel') ElMessage.error('删除异常');
  }
};

// 初始化
onMounted(() => {
  fetchHostList();
  fetchDeptList();
});
</script>

<style scoped>
/* 复用统一样式，仅调整容器类名 */
.host-container {
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