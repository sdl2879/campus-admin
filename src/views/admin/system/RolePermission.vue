<template>
  <div class="role-permission">
    <!-- 页面标题 + 操作按钮 -->
    <div class="page-header" style="margin-bottom: 20px;">
      <h3 style="margin: 0; color: #1f2d3d;">角色权限管理（RBAC模型）</h3>
      <el-button type="primary" icon="Plus" @click="openRoleDialog">创建角色</el-button>
    </div>

    <!-- 角色列表卡片 -->
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-table :data="roleList" border stripe style="width: 100%;">
        <el-table-column prop="roleId" label="角色ID" width="100" />
        <el-table-column prop="roleName" label="角色名称" width="180" />
        <el-table-column prop="roleDesc" label="角色描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ENABLE' ? 'success' : 'danger'">
              {{ scope.row.status === 'ENABLE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="warning" @click="openPermissionDialog(scope.row)">分配权限</el-button>
            <el-button
                size="small"
                :type="scope.row.status === 'ENABLE' ? 'danger' : 'success'"
                @click="toggleRoleStatus(scope.row)"
            >
              {{ scope.row.status === 'ENABLE' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="text" @click="viewLog(scope.row)">权限日志</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          style="margin-top: 20px; text-align: right;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 权限分配弹窗（核心：精细化权限配置，补充树引用实现选中状态回显） -->
    <el-dialog title="权限分配 - {{ currentRole.roleName }}" v-model="permissionDialogVisible" width="800px">
      <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          show-checkbox
          node-key="permissionId"
          :default-checked-keys="currentRole.permissions"
          props="{ label: 'permissionName', children: 'children' }"
          style="max-height: 400px; overflow-y: auto;"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermission">保存权限</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑角色弹窗 -->
    <el-dialog :title="isEdit ? '编辑角色' : '创建角色'" v-model="roleDialogVisible" width="500px">
      <el-form :model="roleForm" label-width="100px" :rules="roleRules" ref="roleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="如：院系管理员、活动负责人" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio label="ENABLE">启用</el-radio>
            <el-radio label="DISABLE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟角色列表数据
const roleList = ref([
  { roleId: 1, roleName: '系统管理员', roleDesc: '拥有系统全部权限', status: 'ENABLE', createTime: '2026-01-01 10:00:00', permissions: ['1', '2', '3'] },
  { roleId: 2, roleName: '院系管理员', roleDesc: '管理本院系的活动和用户', status: 'ENABLE', createTime: '2026-01-02 10:00:00', permissions: ['2', '2-1', '6'] },
  { roleId: 3, roleName: '活动负责人', roleDesc: '发布、管理自己负责的活动', status: 'ENABLE', createTime: '2026-01-03 10:00:00', permissions: ['2-1', '2-2'] },
  { roleId: 4, roleName: '学生', roleDesc: '参与活动、查看个人分数', status: 'ENABLE', createTime: '2026-01-04 10:00:00', permissions: ['4-2'] }
])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(roleList.value.length)

// 弹窗控制
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEdit = ref(false)
const currentRole = ref({})

// 角色表单
const roleFormRef = ref(null)
const roleForm = reactive({
  roleName: '',
  roleDesc: '',
  status: 'ENABLE'
})

// 表单校验规则
const roleRules = reactive({
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
})

// 权限树引用（关键：实现选中状态回显和获取选中值）
const permissionTreeRef = ref(null)

// 模拟权限树数据（精细化权限：菜单/操作/数据权限）
const permissionTree = ref([
  {
    permissionId: '1',
    permissionName: '系统管理',
    children: [
      { permissionId: '1-1', permissionName: '角色权限管理' },
      { permissionId: '1-2', permissionName: '用户管理' },
      { permissionId: '1-3', permissionName: '系统配置' },
      { permissionId: '1-4', permissionName: '日志管理' }
    ]
  },
  {
    permissionId: '2',
    permissionName: '活动管理',
    children: [
      { permissionId: '2-1', permissionName: '活动全生命周期' },
      { permissionId: '2-2', permissionName: '活动审核管理' },
      { permissionId: '2-3', permissionName: '活动数据管理' }
    ]
  },
  { permissionId: '3', permissionName: '智能推荐管理' },
  {
    permissionId: '4',
    permissionName: '数据统计分析',
    children: [{ permissionId: '4-2', permissionName: '个人数据查看' }]
  },
  { permissionId: '5', permissionName: '消息与通知管理' },
  { permissionId: '6', permissionName: '院系管理' },
  { permissionId: '7', permissionName: '小程序配置管理' }
])

// 打开创建角色弹窗
const openRoleDialog = () => {
  isEdit.value = false
  // 重置表单
  roleFormRef.value?.resetFields()
  Object.assign(roleForm, { roleName: '', roleDesc: '', status: 'ENABLE' })
  roleDialogVisible.value = true
}

// 打开编辑角色弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  currentRole.value = row
  Object.assign(roleForm, {
    roleName: row.roleName,
    roleDesc: row.roleDesc,
    status: row.status
  })
  roleDialogVisible.value = true
}

// 打开权限分配弹窗（补充：权限树选中状态回显）
const openPermissionDialog = (row) => {
  currentRole.value = row
  permissionDialogVisible.value = true
  // 等待弹窗渲染完成后，设置权限树选中状态
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys(row.permissions)
  })
}

// 保存角色
const saveRole = () => {
  roleFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑逻辑
        const index = roleList.value.findIndex(item => item.roleId === currentRole.value.roleId)
        roleList.value[index] = { ...roleList.value[index], ...roleForm }
        ElMessage.success('编辑角色成功')
      } else {
        // 创建逻辑
        const newRole = {
          roleId: roleList.value.length + 1,
          ...roleForm,
          createTime: new Date().toLocaleString().replace(/\//g, '-'),
          permissions: []
        }
        roleList.value.push(newRole)
        total.value = roleList.value.length
        ElMessage.success('创建角色成功')
      }
      roleDialogVisible.value = false
    }
  })
}

// 保存权限（补充：获取选中的权限并更新角色）
const savePermission = () => {
  // 获取权限树选中的节点ID
  const checkedPermissions = permissionTreeRef.value?.getCheckedKeys() || []
  // 更新当前角色的权限
  const index = roleList.value.findIndex(item => item.roleId === currentRole.value.roleId)
  roleList.value[index].permissions = checkedPermissions
  ElMessage.success(`【${currentRole.value.roleName}】权限分配成功，已选中${checkedPermissions.length}项权限`)
  permissionDialogVisible.value = false
}

// 切换角色状态
const toggleRoleStatus = (row) => {
  row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
  ElMessage.success(`角色【${row.roleName}】${row.status === 'ENABLE' ? '启用' : '禁用'}成功`)
}

// 查看权限日志
const viewLog = (row) => {
  ElMessage.info(`查看【${row.roleName}】的权限变更日志：最近一次变更时间2026-01-10 15:30:00`)
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
}
const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 优化权限树样式 */
:deep(.el-tree-node__label) {
  font-size: 14px;
}
:deep(.el-tree-node__children) {
  padding-left: 20px;
}
</style>