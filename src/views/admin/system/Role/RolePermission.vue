
<template>
  <div class="role-permission-container">
    <div class="page-header">
      <h3>鏉冮檺鍒嗛厤 - {{ roleName }}</h3>
      <el-button type="primary" @click="submitPermission">淇濆瓨鏉冮檺</el-button>
    </div>

    
    <el-tabs v-model="activeTab" type="card" class="permission-tabs">
      
      <el-tab-pane label="鑿滃崟鏉冮檺" name="menu">
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

      
      <el-tab-pane label="鎿嶄綔鏉冮檺" name="operation">
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
                  {{ operation.operationName }}锛坽{ operation.operationCode }}锛?
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      
      <el-tab-pane label="鏁版嵁鏉冮檺" name="data">
        <el-card class="permission-card">
          <el-form :model="dataPermissionForm" label-width="120px">
            <el-form-item label="鏁版嵁鏉冮檺鑼冨洿">
              <el-radio-group v-model="dataPermissionForm.dataScope">
                <el-radio label="鍏ㄩ儴鏁版嵁">鍏ㄩ儴鏁版嵁</el-radio>
                <el-radio label="鑷畾涔夋暟鎹?>鑷畾涔夋暟鎹紙鎸夐櫌绯?閮ㄩ棬锛?/el-radio>
                <el-radio label="鏈汉鏁版嵁">浠呮湰浜哄垱寤烘暟鎹?/el-radio>
                <el-radio label="瑙掕壊鏁版嵁">鍚岃鑹茬敤鎴锋暟鎹?/el-radio>
              </el-radio-group>
            </el-form-item>

            
            <el-form-item
                label="鍙€夐櫌绯?
                v-if="dataPermissionForm.dataScope === '鑷畾涔夋暟鎹?"
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
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
// 瀵煎叆鏉冮檺鐩稿叧鎺ュ彛
import { getRolePermission, saveRolePermission } from '@/api/system/role';
// 瀵煎叆闄㈢郴鎺ュ彛锛堟暟鎹潈闄愮敤锛?
import { getDeptTree } from '@/api/dept/deptInfo';

const route = useRoute();
const router = useRouter();

// 褰撳墠瑙掕壊ID锛堜粠璺敱鍙傛暟鑾峰彇锛?
const roleId = ref(route.params.roleId);
// 瑙掕壊鍚嶇О锛堢敤浜庨〉闈㈡爣棰橈級
const roleName = ref('');
// 婵€娲荤殑鏍囩椤?
const activeTab = ref('menu');

// 鑿滃崟鏉冮檺鐩稿叧
const menuTree = ref([]); // 鑿滃崟鏍戝舰缁撴瀯
const treeProps = ref({
  label: 'menuName',
  children: 'children'
});
const checkedMenuKeys = ref([]); // 宸查€夎彍鍗旾D闆嗗悎

// 鎿嶄綔鏉冮檺鐩稿叧
const operationMap = ref({}); // 鎿嶄綔鏉冮檺鍒嗙粍锛坘ey锛氳彍鍗旾D锛寁alue锛歿menuName, operations[]}锛?
const checkedOperationKeys = ref({}); // 宸查€夋搷浣淚D闆嗗悎锛坘ey锛氳彍鍗旾D锛寁alue锛歔operationId1, ...]锛?

// 鏁版嵁鏉冮檺鐩稿叧
const dataPermissionForm = ref({
  dataScope: '鍏ㄩ儴鏁版嵁' // 鏁版嵁鏉冮檺鑼冨洿锛氬叏閮?鑷畾涔?鏈汉/瑙掕壊
});
const deptTree = ref([]); // 闄㈢郴鏍戝舰缁撴瀯
const checkedDeptKeys = ref([]); // 宸查€夐櫌绯籌D闆嗗悎

// 鑾峰彇瑙掕壊宸叉湁鏉冮檺
const fetchRolePermission = async () => {
  try {
    const res = await getRolePermission({ roleId: roleId.value });
    if (res.code === 200) {
      const permissionData = res.data;
      // 璧嬪€艰鑹插悕绉?
      roleName.value = permissionData.roleName || '鏈煡瑙掕壊';

      // 鑿滃崟鏉冮檺
      menuTree.value = permissionData.menuTree;
      checkedMenuKeys.value = permissionData.checkedMenuIds || [];

      // 鎿嶄綔鏉冮檺
      operationMap.value = permissionData.operationMap || {};
      // 鍒濆鍖栧凡閫夋搷浣滄潈闄?
      Object.keys(operationMap.value).forEach(menuId => {
        checkedOperationKeys.value[menuId] = permissionData.checkedOperationIds[menuId] || [];
      });

      // 鏁版嵁鏉冮檺
      dataPermissionForm.value.dataScope = permissionData.dataScope || '鍏ㄩ儴鏁版嵁';
      checkedDeptKeys.value = permissionData.checkedDeptIds || [];
    } else {
      ElMessage.error(res.msg || '鑾峰彇瑙掕壊鏉冮檺澶辫触');
    }
  } catch (error) {
    ElMessage.error('鑾峰彇瑙掕壊鏉冮檺寮傚父');
    console.error(error);
  }
};

// 鑾峰彇闄㈢郴鏍戝舰缁撴瀯锛堟暟鎹潈闄愮敤锛?
const fetchDeptTree = async () => {
  try {
    const res = await getDeptTree();
    if (res.code === 200) {
      deptTree.value = res.data;
    } else {
      ElMessage.error(res.msg || '鑾峰彇闄㈢郴鍒楄〃澶辫触');
    }
  } catch (error) {
    ElMessage.error('鑾峰彇闄㈢郴鍒楄〃寮傚父');
    console.error(error);
  }
};

// 鑿滃崟鏉冮檺鍕鹃€変簨浠?
const handleMenuCheck = (checkedKeys) => {
  checkedMenuKeys.value = checkedKeys;
};

// 鎿嶄綔鏉冮檺鍕鹃€変簨浠?
const handleOperationCheck = (menuId) => {
  // 鏃犻渶棰濆閫昏緫锛寁-model 宸茬粦瀹?
};

// 闄㈢郴鍕鹃€変簨浠讹紙鏁版嵁鏉冮檺锛?
const handleDeptCheck = (checkedKeys) => {
  checkedDeptKeys.value = checkedKeys;
};

// 淇濆瓨鏉冮檺閰嶇疆
const submitPermission = async () => {
  try {
    // 鏋勯€犳彁浜ゅ弬鏁?
    const submitData = {
      roleId: roleId.value,
      checkedMenuIds: checkedMenuKeys.value,
      checkedOperationIds: checkedOperationKeys.value,
      dataScope: dataPermissionForm.value.dataScope,
      checkedDeptIds: checkedDeptKeys.value
    };

    const res = await saveRolePermission(submitData);
    if (res.code === 200) {
      ElMessage.success('鏉冮檺閰嶇疆淇濆瓨鎴愬姛');
      router.push('/admin/system/role/list'); // 杩斿洖瑙掕壊鍒楄〃
    } else {
      ElMessage.error(res.msg || '鏉冮檺閰嶇疆淇濆瓨澶辫触');
    }
  } catch (error) {
    ElMessage.error('鏉冮檺閰嶇疆淇濆瓨寮傚父');
    console.error(error);
  }
};

// 鐩戝惉鏁版嵁鏉冮檺鑼冨洿鍙樻洿
watch(
    () => dataPermissionForm.value.dataScope,
    (newVal) => {
      // 鍒囨崲鍒扳€滆嚜瀹氫箟鏁版嵁鈥濇椂锛屽姞杞介櫌绯绘爲
      if (newVal === '鑷畾涔夋暟鎹? && deptTree.value.length === 0) {
        fetchDeptTree();
      }
    }
);

// 椤甸潰鎸傝浇鏃跺垵濮嬪寲鏁版嵁
onMounted(() => {
  fetchRolePermission();
});
</script>

<style scoped>
.role-permission-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.permission-tabs {
  width: 100%;
}

.permission-card {
  padding: 20px;
}

.permission-tree {
  max-height: 600px;
  overflow-y: auto;
}

.operation-permission {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.operation-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.operation-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.data-scope-dept {
  margin-top: 10px;
}

.dept-tree {
  max-height: 400px;
  overflow-y: auto;
}
</style>