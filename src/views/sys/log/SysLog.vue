<template>
  <div class="sys-log-container">
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
      <!-- 操作日志标签 -->
      <el-tab-pane label="操作日志" name="operation">
        <!-- 操作日志筛选栏 -->
        <div class="search-bar">
          <el-input v-model="operationQuery.userName" placeholder="请输入用户名" style="width: 150px; margin-right: 10px;"></el-input>
          <el-input v-model="operationQuery.module" placeholder="请输入操作模块" style="width: 150px; margin-right: 10px;"></el-input>
          <el-select v-model="operationQuery.operation" placeholder="请选择操作类型" style="width: 120px; margin-right: 10px;">
            <el-option label="新增" value="新增"></el-option>
            <el-option label="编辑" value="编辑"></el-option>
            <el-option label="删除" value="删除"></el-option>
            <el-option label="查询" value="查询"></el-option>
            <el-option label="分配" value="分配"></el-option>
          </el-select>
          <el-select v-model="operationQuery.status" placeholder="请选择操作状态" style="width: 120px; margin-right: 10px;">
            <el-option label="成功" value="1"></el-option>
            <el-option label="失败" value="0"></el-option>
          </el-select>
          <el-date-picker
              v-model="operationTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 300px; margin-right: 10px;"
          ></el-date-picker>
          <el-button type="primary" @click="getOperationLogList">查询</el-button>
          <el-button type="success" @click="exportOperationLog">导出Excel</el-button>
        </div>

        <!-- 操作日志列表 -->
        <el-table :data="operationLogList" border stripe style="margin-top: 10px;">
          <el-table-column prop="id" label="日志ID" width="80"></el-table-column>
          <el-table-column prop="userName" label="操作用户" width="100"></el-table-column>
          <el-table-column prop="roleType" label="角色类型" width="100"></el-table-column>
          <el-table-column prop="module" label="操作模块" width="120"></el-table-column>
          <el-table-column prop="operation" label="操作类型" width="100"></el-table-column>
          <el-table-column prop="operationResult" label="操作结果" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.operationResult }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operationIp" label="操作IP" width="120"></el-table-column>
          <el-table-column prop="operationTime" label="操作时间" width="200">
            <template #default="scope">
              {{ formatTime(scope.row.operationTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="operationDetail" label="操作详情" min-width="200"></el-table-column>
        </el-table>

        <!-- 操作日志分页 -->
        <el-pagination
            @size-change="handleOperationSizeChange"
            @current-change="handleOperationCurrentChange"
            :current-page="operationPageNum"
            :page-sizes="[10, 20, 50]"
            :page-size="operationPageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="operationTotal"
            style="margin-top: 10px; text-align: right;"
        />
      </el-tab-pane>

      <!-- 登录日志标签 -->
      <el-tab-pane label="登录日志" name="login">
        <!-- 登录日志筛选栏 -->
        <div class="search-bar">
          <el-input v-model="loginQuery.userName" placeholder="请输入用户名" style="width: 150px; margin-right: 10px;"></el-input>
          <el-select v-model="loginQuery.loginResult" placeholder="请选择登录结果" style="width: 120px; margin-right: 10px;">
            <el-option label="成功" value="成功"></el-option>
            <el-option label="失败" value="失败"></el-option>
          </el-select>
          <el-select v-model="loginQuery.loginType" placeholder="请选择登录类型" style="width: 120px; margin-right: 10px;">
            <el-option label="密码登录" value="密码登录"></el-option>
            <el-option label="验证码登录" value="验证码登录"></el-option>
          </el-select>
          <el-date-picker
              v-model="loginTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 300px; margin-right: 10px;"
          ></el-date-picker>
          <el-button type="primary" @click="getLoginLogList">查询</el-button>
          <el-button type="success" @click="exportLoginLog">导出Excel</el-button>
        </div>

        <!-- 登录日志列表 -->
        <el-table :data="loginLogList" border stripe style="margin-top: 10px;">
          <el-table-column prop="id" label="日志ID" width="80"></el-table-column>
          <el-table-column prop="userName" label="登录用户名" width="120"></el-table-column>
          <el-table-column prop="loginIp" label="登录IP" width="120"></el-table-column>
          <el-table-column prop="loginResult" label="登录结果" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.loginResult === '成功' ? 'success' : 'danger'">
                {{ scope.row.loginResult }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="failReason" label="失败原因" min-width="150"></el-table-column>
          <el-table-column prop="loginType" label="登录类型" width="120"></el-table-column>
          <el-table-column prop="device" label="登录设备" width="100"></el-table-column>
          <el-table-column prop="loginTime" label="登录时间" width="200">
            <template #default="scope">
              {{ formatTime(scope.row.loginTime) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 登录日志分页 -->
        <el-pagination
            @size-change="handleLoginSizeChange"
            @current-change="handleLoginCurrentChange"
            :current-page="loginPageNum"
            :page-sizes="[10, 20, 50]"
            :page-size="loginPageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="loginTotal"
            style="margin-top: 10px; text-align: right;"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import service from '@/utils/service'; // ✅ 使用统一 service
import dayjs from 'dayjs';

// 标签页激活状态
const activeTab = ref('operation');

// ====================== 操作日志相关 ======================
const operationPageNum = ref(1);
const operationPageSize = ref(10);
const operationTotal = ref(0);
const operationLogList = ref([]);
const operationQuery = reactive({
  userName: '',
  module: '',
  operation: '',
  status: '',
  startTime: '',
  endTime: ''
});
const operationTimeRange = ref([]);

// ====================== 登录日志相关 ======================
const loginPageNum = ref(1);
const loginPageSize = ref(10);
const loginTotal = ref(0);
const loginLogList = ref([]);
const loginQuery = reactive({
  userName: '',
  loginResult: '',
  loginType: '',
  startTime: '',
  endTime: ''
});
const loginTimeRange = ref([]);

// 初始化加载操作日志
onMounted(() => {
  getOperationLogList();
});

// ====================== 操作日志方法 ======================
const getOperationLogList = async () => {
  try {
    if (operationTimeRange.value?.length === 2) {
      operationQuery.startTime = dayjs(operationTimeRange.value[0]).format('YYYY-MM-DD HH:mm:ss');
      operationQuery.endTime = dayjs(operationTimeRange.value[1]).format('YYYY-MM-DD HH:mm:ss');
    } else {
      operationQuery.startTime = '';
      operationQuery.endTime = '';
    }

    const res = await service.get('/sys/log/operation/page', {
      params: {
        pageNum: operationPageNum.value,
        pageSize: operationPageSize.value,
        userName: operationQuery.userName || undefined,
        module: operationQuery.module || undefined,
        operation: operationQuery.operation || undefined,
        status: operationQuery.status || undefined,
        startTime: operationQuery.startTime || undefined,
        endTime: operationQuery.endTime || undefined
      }
    });

    if (res.code === 200) {
      operationLogList.value = Array.isArray(res.data) ? res.data : [];
      operationTotal.value = typeof res.total === 'number' ? res.total : 0;
    } else {
      ElMessage.error(res.msg || '获取操作日志失败');
    }
  } catch (e) {
    ElMessage.error('网络错误');
  }
};

const handleOperationSizeChange = (val) => {
  operationPageSize.value = val;
  getOperationLogList();
};
const handleOperationCurrentChange = (val) => {
  operationPageNum.value = val;
  getOperationLogList();
};

const exportOperationLog = () => {
  const url = new URL(`${service.defaults.baseURL}/sys/log/operation/export`);
  const params = {
    userName: operationQuery.userName,
    module: operationQuery.module,
    operation: operationQuery.operation,
    status: operationQuery.status
  };
  if (operationTimeRange.value?.length === 2) {
    params.startTime = dayjs(operationTimeRange.value[0]).format('YYYY-MM-DD HH:mm:ss');
    params.endTime = dayjs(operationTimeRange.value[1]).format('YYYY-MM-DD HH:mm:ss');
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  window.open(url.href, '_blank');
  ElMessage.success('开始导出操作日志');
};

// ====================== 登录日志方法 ======================
const getLoginLogList = async () => {
  try {
    if (loginTimeRange.value?.length === 2) {
      loginQuery.startTime = dayjs(loginTimeRange.value[0]).format('YYYY-MM-DD HH:mm:ss');
      loginQuery.endTime = dayjs(loginTimeRange.value[1]).format('YYYY-MM-DD HH:mm:ss');
    } else {
      loginQuery.startTime = '';
      loginQuery.endTime = '';
    }

    const res = await service.get('/sys/log/login/page', {
      params: {
        pageNum: loginPageNum.value,
        pageSize: loginPageSize.value,
        userName: loginQuery.userName || undefined,
        loginResult: loginQuery.loginResult || undefined,
        loginType: loginQuery.loginType || undefined,
        startTime: loginQuery.startTime || undefined,
        endTime: loginQuery.endTime || undefined
      }
    });

    if (res.code === 200) {
      loginLogList.value = Array.isArray(res.data) ? res.data : [];
      loginTotal.value = typeof res.total === 'number' ? res.total : 0;
    } else {
      ElMessage.error(res.msg || '获取登录日志失败');
    }
  } catch (e) {
    ElMessage.error('网络错误');
  }
};

const handleLoginSizeChange = (val) => {
  loginPageSize.value = val;
  getLoginLogList();
};
const handleLoginCurrentChange = (val) => {
  loginPageNum.value = val;
  getLoginLogList();
};

const exportLoginLog = () => {
  const url = new URL(`${service.defaults.baseURL}/sys/log/login/export`);
  const params = {
    userName: loginQuery.userName,
    loginResult: loginQuery.loginResult,
    loginType: loginQuery.loginType
  };
  if (loginTimeRange.value?.length === 2) {
    params.startTime = dayjs(loginTimeRange.value[0]).format('YYYY-MM-DD HH:mm:ss');
    params.endTime = dayjs(loginTimeRange.value[1]).format('YYYY-MM-DD HH:mm:ss');
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  window.open(url.href, '_blank');
  ElMessage.success('开始导出登录日志');
};

const formatTime = (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '';

const handleTabChange = (tab) => {
  if (tab === 'login') {
    getLoginLogList();
  }
};
</script>

<style scoped>
.sys-log-container {
  padding: 20px;
}
.search-bar {
  margin-bottom: 10px;
}
</style>