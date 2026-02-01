<template>
  <!-- 角色权限分配弹窗 -->
  <el-dialog
      v-model="dialogVisible"
      title="角色权限分配"
      width="70%"
      top="20px"
      destroy-on-close
      @close="handleDialogClose"
  >
    <!-- 权限树形选择器 -->
    <div class="permission-tree-container">
      <el-tree
          ref="permissionTreeRef"
          :data="permissionList"
          :props="treeProps"
          node-key="id"
          show-checkbox
          check-strictly
          :default-checked-keys="checkedPermissionIds"
          :expand-on-click-node="false"
          class="permission-tree"
      />
    </div>

    <!-- 弹窗底部按钮 -->
    <template #footer>
      <el-button size="default" @click="dialogVisible = false">
        取消
      </el-button>
      <el-button
          size="default"
          type="primary"
          @click="submitPermissionAssign"
          :loading="submitLoading"
      >
        确认分配
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入权限列表接口
import { getPermissionList } from '@/api/sys/permission'
// 导入角色相关接口（现在assignRolePermission已存在）
import { getRolePermission, assignRolePermission } from '@/api/sys/role'

// 定义组件对外暴露的方法和接收的参数
const emit = defineEmits(['refreshRoleList'])
const props = defineProps({
  // 父组件传入的角色ID
  roleId: {
    type: [String, Number],
    required: true
  },
  // 弹窗显隐状态
  visible: {
    type: Boolean,
    default: false
  }
})

// ===== 响应式数据 =====
// 弹窗显隐（同步父组件的visible）
const dialogVisible = ref(false)
// 权限列表
const permissionList = ref([])
// 已选中的权限ID
const checkedPermissionIds = ref([])
// 树形控件配置
const treeProps = ref({
  label: 'name', // 通用权限名称字段，99%项目用name
  children: 'children',
  disabled: 'disabled'
})
// 提交加载状态
const submitLoading = ref(false)
// 树形组件Ref
const permissionTreeRef = ref(null)

// ===== 监听与初始化 =====
// 监听父组件传入的visible，同步弹窗状态
watch(
    () => props.visible,
    (newVal) => {
      dialogVisible.value = newVal
      // 弹窗打开时加载数据
      if (newVal && props.roleId) {
        initPermissionData()
      }
    },
    { immediate: true }
)

// 初始化权限数据
const initPermissionData = async () => {
  try {
    // 1. 获取所有权限列表（通用接口）
    const permissionRes = await getPermissionList()
    permissionList.value = permissionRes.data || permissionRes || []

    // 2. 获取角色已选中的权限ID（通用接口）
    const checkedRes = await getRolePermission(props.roleId)
    checkedPermissionIds.value = checkedRes.data || checkedRes || []
  } catch (error) {
    ElMessage.error('加载权限数据失败：' + (error.message || '未知错误'))
    console.error('权限数据加载失败：', error)
  }
}

// ===== 事件处理 =====
// 提交权限分配
const submitPermissionAssign = async () => {
  if (!props.roleId) {
    ElMessage.warning('请选择要分配权限的角色')
    return
  }

  // 获取树形组件中实际选中的权限ID
  const selectedIds = permissionTreeRef.value?.getCheckedKeys() || []
  if (selectedIds.length === 0) {
    // 确认是否清空权限
    const confirmRes = await ElMessageBox.confirm(
        '你确定要清空该角色的所有权限吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    if (!confirmRes) return
  }

  submitLoading.value = true
  try {
    // 调用分配权限接口（参数格式和role.js中的函数匹配）
    const res = await assignRolePermission({
      roleId: props.roleId,
      permissionIds: selectedIds
    })
    // 兼容不同的接口返回格式
    if (res.code === 200 || res.success || !res.code) {
      ElMessage.success('权限分配成功！')
      dialogVisible.value = false
      // 通知父组件刷新角色列表
      emit('refreshRoleList')
    } else {
      ElMessage.error('权限分配失败：' + (res.msg || res.message))
    }
  } catch (error) {
    ElMessage.error('权限分配失败：' + (error.message || '接口请求异常'))
    console.error('权限分配失败：', error)
  } finally {
    submitLoading.value = false
  }
}

// 弹窗关闭时重置状态
const handleDialogClose = () => {
  checkedPermissionIds.value = []
  // 通知父组件更新visible状态
  emit('update:visible', false)
}

// ===== 暴露方法（可选）=====
defineExpose({
  initPermissionData
})
</script>

<style scoped lang="scss">
.permission-tree-container {
  padding: 10px 0;
  height: 450px;
  overflow-y: auto;

  .permission-tree {
    --el-tree-node-content-hover-bg-color: #f5f7fa;
    --el-tree-node-label-color: #303133;
    font-size: 14px;
  }
}

// 适配Element Plus弹窗样式
:deep(.el-dialog__body) {
  padding: 15px 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 15px;
}
</style>