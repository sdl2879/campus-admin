<template>
  <div class="sys-config-container">
    <!-- 筛选栏 -->
    <div class="search-bar">
      <el-select v-model="searchType" placeholder="请选择配置类型" style="width: 150px; margin-right: 10px;">
        <el-option label="全部" value=""></el-option>
        <el-option label="基础信息" value="1"></el-option>
        <el-option label="安全配置" value="2"></el-option>
        <el-option label="推荐算法" value="3"></el-option>
      </el-select>
      <el-input v-model="searchKey" placeholder="请输入配置键" style="width: 200px; margin-right: 10px;"></el-input>
      <el-button type="primary" @click="getConfigList">查询</el-button>
      <el-button type="success" @click="openAddConfig">新增配置</el-button>
    </div>

    <!-- 配置列表 -->
    <el-table :data="configList" border stripe style="margin-top: 10px;">
      <el-table-column prop="id" label="配置ID" width="80"></el-table-column>
      <el-table-column prop="configKey" label="配置键" width="180"></el-table-column>
      <el-table-column prop="configValue" label="配置值" min-width="200">
        <template #default="scope">
          <div v-if="scope.row.configValue.length > 50">
            {{ scope.row.configValue.substring(0, 50) }}...
            <el-button size="mini" type="text" @click="viewFullValue(scope.row.configValue)">查看完整</el-button>
          </div>
          <div v-else>{{ scope.row.configValue }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="configType" label="配置类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.configType === 1 ? 'primary' : scope.row.configType === 2 ? 'warning' : 'success'">
            {{ scope.row.configType === 1 ? '基础' : scope.row.configType === 2 ? '安全' : '算法' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editConfig(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteConfig(scope.row.id)">删除</el-button>
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

    <!-- 新增/编辑配置弹窗 -->
    <el-dialog v-model="dialogVisible" title="配置表单" width="500px">
      <el-form :model="configForm" label-width="100px" :rules="configRules" ref="configFormRef">
        <el-form-item label="配置键" prop="configKey">
          <el-input v-model="configForm.configKey" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input
              v-model="configForm.configValue"
              type="textarea"
              :rows="3"
              :placeholder="getPlaceholderByType(configForm.configType)"
          ></el-input>
        </el-form-item>
        <el-form-item label="配置类型" prop="configType">
          <el-select v-model="configForm.configType">
            <el-option label="基础信息" :value="1"></el-option>
            <el-option label="安全配置" :value="2"></el-option>
            <el-option label="推荐算法" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="configForm.remark" type="textarea" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitConfig">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看完整配置值弹窗 -->
    <el-dialog v-model="fullValueVisible" title="完整配置值" width="500px">
      <el-input v-model="fullValue" type="textarea" :rows="8" readonly></el-input>
      <template #footer>
        <el-button @click="fullValueVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import service from '@/utils/service'; // ✅ 使用统一 service

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const configList = ref([]);

// 筛选参数
const searchType = ref('');
const searchKey = ref('');

// 弹窗相关
const dialogVisible = ref(false);
const fullValueVisible = ref(false);
const isEdit = ref(false);
const fullValue = ref('');
const configFormRef = ref(null);
const configForm = reactive({
  id: '',
  configKey: '',
  configValue: '',
  configType: '',
  remark: ''
});

// 表单校验规则
const configRules = reactive({
  configKey: [{ required: true, message: '配置键不能为空', trigger: 'blur' }],
  configValue: [{ required: true, message: '配置值不能为空', trigger: 'blur' }],
  configType: [{ required: true, message: '请选择配置类型', trigger: 'change' }]
});

// 初始化加载配置列表
onMounted(() => {
  getConfigList();
});

// 获取配置列表
const getConfigList = async () => {
  try {
    const res = await service.get('/sys/config/page', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        configType: searchType.value || undefined,
        configKey: searchKey.value || undefined
      }
    });

    if (res.code === 200) {
      configList.value = Array.isArray(res.data) ? res.data : [];
      total.value = typeof res.total === 'number' ? res.total : 0;
    } else {
      ElMessage.error(res.msg || '获取配置列表失败');
      configList.value = [];
      total.value = 0;
    }
  } catch (e) {
    ElMessage.error('网络错误，请检查后端服务');
  }
};

// 分页变更
const handleSizeChange = (val) => {
  pageSize.value = val;
  getConfigList();
};
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getConfigList();
};

// 打开新增配置弹窗
const openAddConfig = () => {
  dialogVisible.value = true;
  isEdit.value = false;
  resetConfigForm();
};

// 编辑配置
const editConfig = (row) => {
  dialogVisible.value = true;
  isEdit.value = true;
  configForm.id = row.id;
  configForm.configKey = row.configKey;
  configForm.configValue = row.configValue;
  configForm.configType = row.configType; // 注意：后端是 number
  configForm.remark = row.remark;
  setTimeout(() => configFormRef.value?.clearValidate(), 100);
};

// 重置配置表单
const resetConfigForm = () => {
  Object.assign(configForm, { id: '', configKey: '', configValue: '', configType: '', remark: '' });
  configFormRef.value?.clearValidate();
};

// 提交配置表单
const submitConfig = async () => {
  try {
    await configFormRef.value.validate();

    const res = await service.post('/sys/config/saveOrUpdate', configForm);
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '配置编辑成功' : '配置新增成功');
      dialogVisible.value = false;
      getConfigList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (e) {
    if (e.name !== 'ValidationError') {
      ElMessage.error(e.response?.data?.msg || '操作失败');
    }
  }
};

// 删除配置
const deleteConfig = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该配置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    });

    const res = await service.delete(`/sys/config/${id}`);
    if (res.code === 200) {
      ElMessage.success('配置删除成功');
      getConfigList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (e) {
    if (e.name !== 'Cancel') ElMessage.error('操作失败');
  }
};

// 查看完整配置值
const viewFullValue = (value) => {
  fullValue.value = value;
  fullValueVisible.value = true;
};

// 根据配置类型获取占位提示
const getPlaceholderByType = (type) => {
  switch (type) {
    case 1: return '如：XX大学、2024-2025学年第1学期';
    case 2: return '如：密码规则正则、登录失败次数5、JWT过期时间120';
    case 3: return '如：权重60.00、开关1/0';
    default: return '请输入配置值';
  }
};
</script>

<style scoped>
.sys-config-container {
  padding: 20px;
}
.search-bar {
  margin-bottom: 10px;
}
</style>