<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="admin-form">
    <el-form-item label="管理员账号" prop="username" :disabled="isEdit">
      <el-input v-model="form.username" placeholder="请输入管理员账号（字母/数字）" />
    </el-form-item>
    <el-form-item label="管理员姓名" prop="realName">
      <el-input v-model="form.realName" placeholder="请输入管理员真实姓名" />
    </el-form-item>
    <el-form-item label="联系电话" prop="phone">
      <el-input v-model="form.phone" placeholder="请输入联系电话" />
    </el-form-item>
    <el-form-item label="所属角色" prop="roleIds">
      <el-select v-model="form.roleIds" multiple placeholder="请选择角色" class="role-select">
        <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="初始密码" prop="password" v-if="!isEdit">
      <el-input v-model="form.password" type="password" placeholder="请设置初始密码（不少于6位）" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-select v-model="form.status" placeholder="请选择状态">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';

// 定义Props（接收父组件参数）
const props = defineProps({
  // 是否为编辑模式
  isEdit: {
    type: Boolean,
    default: false
  },
  // 角色列表（下拉选择用）
  roleList: {
    type: Array,
    default: () => []
  },
  // 编辑时的初始数据
  initialData: {
    type: Object,
    default: () => ({})
  }
});

// 定义Emits（向父组件传递事件）
const emit = defineEmits(['submit', 'cancel']);

// 表单实例
const formRef = ref(null);

// 表单数据
const form = ref({
  id: '',
  username: '',
  realName: '',
  phone: '',
  roleIds: [],
  password: '',
  status: '1'
});

// 表单校验规则
const rules = ref({
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号仅支持字母、数字、下划线', trigger: 'blur' }
  ],
  realName: [{ required: true, message: '请输入管理员姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  roleIds: [{ required: true, message: '请选择所属角色', trigger: 'change' }],
  password: [{ required: true, message: '请设置初始密码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 监听isEdit变化，初始化表单数据
watch(
    () => props.isEdit,
    (newVal) => {
      if (newVal) {
        // 编辑模式：赋值初始数据
        form.value = { ...props.initialData };
        // 编辑时移除密码校验
        rules.value.password = [];
      } else {
        // 新增模式：重置表单
        formRef.value?.resetFields();
        form.value = {
          id: '',
          username: '',
          realName: '',
          phone: '',
          roleIds: [],
          password: '',
          status: '1'
        };
        // 新增时添加密码校验
        rules.value.password = [{ required: true, message: '请设置初始密码', trigger: 'blur' }];
      }
    },
    { immediate: true }
);

// 表单提交（供父组件调用）
const handleSubmit = async () => {
  try {
    if (!formRef.value) return;
    await formRef.value.validate();
    // 向父组件传递提交数据
    emit('submit', form.value);
  } catch (error) {
    ElMessage.error('表单校验失败，请检查输入');
    console.error(error);
  }
};

// 暴露方法给父组件
defineExpose({
  handleSubmit,
  formRef
});
</script>

<style scoped>
.admin-form {
  margin-top: 20px;
}

.role-select {
  width: 100%;
}
</style>