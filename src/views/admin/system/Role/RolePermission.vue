<template>
  <div class="role-permission-container">
    <div class="page-header">
      <h3>权限分配 - {{ roleName }}</h3>
      <el-button type="primary" class="save-btn" @click="submitPermission">保存权限</el-button>
    </div>

    <!-- 权限分类标签页 -->
    <el-tabs v-model="activeTab" type="card" class="permission-tabs">
      <!-- 菜单权限 -->
      <el-tab-pane label="菜单权限" name="menu">
        <el-card class="permission-card">
          <el-tree
              :data="menuTree"
              :props="treeProps"
              show-checkbox
              node-key="id"
              :default-checked-keys="checkedMenuKeys"
              @check="handleMenuCheck"
              class="permission-tree"
          />
        </el-card>
      </el-tab-pane>

      <!-- 操作权限 -->
      <el-tab-pane label="操作权限" name="operation">
        <el-card class="permission-card">
          <div class="operation-permission">
            <div v-for="(operationGroup, menuId) in operationMap" :key="menuId">
              <h4 class="operation-group-title">{{ operationGroup.menuName }}</h4>
              <el-checkbox-group
                  v-model="checkedOperationKeys[menuId]"
                  @change="handleOperationCheck(menuId)"
                  class="operation-checkbox-group"
              >
                <el-checkbox
                    v-for="operation in operationGroup.operations"
                    :key="operation.id"
                    :label="operation.id"
                >
                  {{ operation.operationName }}（{{ operation.operationCode }}）
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 数据权限 -->
      <el-tab-pane label="数据权限" name="data">
        <el-card class="permission-card">
          <el-form :model="dataPermissionForm" label-width="120px" class="data-permission-form">
            <el-form-item label="数据权限范围">
              <el-radio-group v-model="dataPermissionForm.dataScope">
                <el-radio label="全部数据">全部数据</el-radio>
                <el-radio label="自定义数据">自定义数据（按院系/部门）</el-radio>
                <el-radio label="本人数据">仅本人创建数据</el-radio>
                <el-radio label="角色数据">同角色用户数据</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 自定义数据权限（按院系） -->
            <el-form-item
                label="可选院系"
                v-if="dataPermissionForm.dataScope === '自定义数据'"
                class="data-scope-dept"
            >
              <el-tree
                  :data="deptTree"
                  :props="treeProps"
                  show-checkbox
                  node-key="id"
                  :default-checked-keys="checkedDeptKeys"
                  @check="handleDeptCheck"
                  class="dept-tree"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
// 1. 导入依赖
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

// 2. 模拟接口（后续替换为真实接口）
const getRolePermission = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          roleName: '系统管理员',
          menuTree: [
            { id: '1', menuName: '系统管理', children: [
                { id: '1-1', menuName: '角色管理' },
                { id: '1-2', menuName: '模块配置' }
              ]},
            { id: '2', menuName: '用户管理', children: [
                { id: '2-1', menuName: '系统管理员管理' },
                { id: '2-2', menuName: '学生管理' }
              ]}
          ],
          checkedMenuIds: ['1', '1-1', '2', '2-2'],
          operationMap: {
            '1-1': {
              menuName: '角色管理',
              operations: [
                { id: 'op1', operationName: '新增角色', operationCode: 'ADD_ROLE' },
                { id: 'op2', operationName: '编辑角色', operationCode: 'EDIT_ROLE' },
                { id: 'op3', operationName: '分配权限', operationCode: 'ASSIGN_PERMISSION' }
              ]
            },
            '2-2': {
              menuName: '学生管理',
              operations: [
                { id: 'op4', operationName: '导入学生', operationCode: 'IMPORT_STUDENT' },
                { id: 'op5', operationName: '修改分值', operationCode: 'UPDATE_SCORE' }
              ]
            }
          },
          checkedOperationIds: { '1-1': ['op1', 'op2'], '2-2': ['op4'] },
          dataScope: '全部数据',
          checkedDeptIds: []
        }
      });
    }, 500);
  });
};
const saveRolePermission = (data) => Promise.resolve({ code: 200 });
const getDeptTree = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: [
          { id: 'dept1', menuName: '计算机学院', children: [
              { id: 'dept1-1', menuName: '软件工程系' },
              { id: 'dept1-2', menuName: '计算机科学系' }
            ]},
          { id: 'dept2', menuName: '文学院', children: [
              { id: 'dept2-1', menuName: '汉语言文学系' }
            ]}
        ]
      });
    }, 500);
  });
};

// 3. 定义所有模板变量（完整初始化）
const route = useRoute();
const router = useRouter();

// 当前角色ID（从路由参数获取）
const roleId = ref(route.params.roleId || '');
// 角色名称
const roleName = ref('未知角色');
// 激活的标签页
const activeTab = ref('menu');

// 菜单权限相关
const menuTree = ref([]);
const treeProps = ref({ label: 'menuName', children: 'children' });
const checkedMenuKeys = ref([]);

// 操作权限相关
const operationMap = ref({});
const checkedOperationKeys = ref({}); // 初始化空对象，避免undefined

// 数据权限相关
const dataPermissionForm = ref({ dataScope: '全部数据' });
const deptTree = ref([]);
const checkedDeptKeys = ref([]);

// 4. 定义所有方法
// 获取角色已有权限
const fetchRolePermission = async () => {
  try {
    const res = await getRolePermission({ roleId: roleId.value });
    if (res.code === 200) {
      const permissionData = res.data;
      roleName.value = permissionData.roleName || '未知角色';
      menuTree.value = permissionData.menuTree || [];
      checkedMenuKeys.value = permissionData.checkedMenuIds || [];
      operationMap.value = permissionData.operationMap || {};
      dataPermissionForm.value.dataScope = permissionData.dataScope || '全部数据';
      checkedDeptKeys.value = permissionData.checkedDeptIds || [];

      // 初始化已选操作权限（避免undefined）
      Object.keys(operationMap.value).forEach(menuId => {
        checkedOperationKeys.value[menuId] = permissionData.checkedOperationIds[menuId] || [];
      });
    } else {
      ElMessage.error(res.msg || '获取角色权限失败');
    }
  } catch (error) {
    ElMessage.error('获取角色权限异常');
    console.error(error);
  }
};

// 获取院系树形结构
const fetchDeptTree = async () => {
  try {
    const res = await getDeptTree();
    if (res.code === 200) {
      deptTree.value = res.data || [];
    } else {
      ElMessage.error(res.msg || '获取院系列表失败');
    }
  } catch (error) {
    ElMessage.error('获取院系列表异常');
    console.error(error);
  }
};

// 菜单权限勾选事件
const handleMenuCheck = (checkedKeys) => {
  checkedMenuKeys.value = checkedKeys;
};

// 操作权限勾选事件
const handleOperationCheck = (menuId) => {
  // v-model已绑定，无需额外逻辑
};

// 院系勾选事件
const handleDeptCheck = (checkedKeys) => {
  checkedDeptKeys.value = checkedKeys;
};

// 保存权限配置
const submitPermission = async () => {
  try {
    const submitData = {
      roleId: roleId.value,
      checkedMenuIds: checkedMenuKeys.value,
      checkedOperationIds: checkedOperationKeys.value,
      dataScope: dataPermissionForm.value.dataScope,
      checkedDeptIds: checkedDeptKeys.value
    };

    const res = await saveRolePermission(submitData);
    if (res.code === 200) {
      ElMessage.success('权限配置保存成功');
      router.push('/admin/system/role/list'); // 返回角色列表
    } else {
      ElMessage.error(res.msg || '权限配置保存失败');
    }
  } catch (error) {
    ElMessage.error('权限配置保存异常');
    console.error(error);
  }
};

// 监听数据权限范围变更
watch(
    () => dataPermissionForm.value.dataScope,
    (newVal) => {
      if (newVal === '自定义数据' && deptTree.value.length === 0) {
        fetchDeptTree();
      }
    }
);

// 页面挂载时初始化
onMounted(() => {
  if (!roleId.value) {
    ElMessage.warning('角色ID不存在');
    router.push('/admin/system/role/list');
    return;
  }
  fetchRolePermission();
});
</script>

<style scoped>
.role-permission-container {
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

.save-btn {
  background-color: #2f54eb;
  border-color: #2f54eb;
}

.permission-tabs {
  width: 100%;
  margin-bottom: 20px;
}

.permission-card {
  padding: 20px;
  border-radius: 4px;
}

.permission-tree {
  max-height: 600px;
  overflow-y: auto;
}

.operation-permission {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.operation-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.operation-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.data-permission-form {
  margin-top: 10px;
}

.data-scope-dept {
  margin-top: 16px;
}

.dept-tree {
  max-height: 400px;
  overflow-y: auto;
}
</style>