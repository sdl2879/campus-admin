
<template>
  <div class="role-log-container">
    <div class="page-header">
      <h3>瑙掕壊鏉冮檺鍙樻洿鏃ュ織 - {{ roleName }}</h3>
      <el-button type="primary" @click="exportLog">瀵煎嚭鏃ュ織</el-button>
    </div>

    
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="鎿嶄綔浜?>
          <el-input v-model="searchForm.operator" placeholder="璇疯緭鍏ユ搷浣滀汉璐﹀彿" clearable />
        </el-form-item>
        <el-form-item label="鎿嶄綔绫诲瀷">
          <el-select v-model="searchForm.operationType" placeholder="璇烽€夋嫨鎿嶄綔绫诲瀷" clearable>
            <el-option label="鏂板瑙掕壊" value="ADD_ROLE" />
            <el-option label="缂栬緫瑙掕壊" value="EDIT_ROLE" />
            <el-option label="鍙樻洿鏉冮檺" value="UPDATE_PERMISSION" />
            <el-option label="鍚敤瑙掕壊" value="ENABLE_ROLE" />
            <el-option label="绂佺敤瑙掕壊" value="DISABLE_ROLE" />
          </el-select>
        </el-form-item>
        <el-form-item label="鎿嶄綔鏃堕棿">
          <el-date-picker
              v-model="searchForm.operationTime"
              type="daterange"
              range-separator="鑷?
              start-placeholder="寮€濮嬫棩鏈?
              end-placeholder="缁撴潫鏃ユ湡"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchRoleLog">鏌ヨ</el-button>
          <el-button @click="resetSearch">閲嶇疆</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card class="table-card">
      <el-table :data="logList" border stripe :loading="tableLoading">
        <el-table-column label="搴忓彿" type="index" width="60" align="center" />
        <el-table-column label="鎿嶄綔浜? prop="operator" align="center" />
        <el-table-column label="鎿嶄綔浜哄悕绉? prop="operatorName" align="center" />
        <el-table-column label="鎿嶄綔绫诲瀷" prop="operationType" align="center">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.operationType)">
              {{ getOperationTypeName(scope.row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="鎿嶄綔鏃堕棿" prop="operationTime" align="center" width="180" />
        <el-table-column label="鎿嶄綔IP" prop="operationIp" align="center" />
        <el-table-column label="鍙樻洿鍐呭" prop="changeContent" align="center" width="300">
          <template #default="scope">
            <el-popover
                trigger="hover"
                placement="top"
                width="600"
                content-class="log-content-popover"
            >
              <template #default>
                <pre class="log-content">{{ scope.row.changeContent }}</pre>
              </template>
              <span class="ellipsis-text">{{ scope.row.changeContent }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="鎿嶄綔鐘舵€? prop="operationStatus" align="center" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.operationStatus === 'SUCCESS' ? 'success' : 'danger'">
              {{ scope.row.operationStatus === 'SUCCESS' ? '鎴愬姛' : '澶辫触' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageInfo.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageInfo.pageSize"
          :total="pageInfo.total"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
// 瀵煎叆鏃ュ織鐩稿叧鎺ュ彛
import { getRoleLog, exportRoleLog } from '@/api/system/role';

const route = useRoute();

// 褰撳墠瑙掕壊ID锛堜粠璺敱鍙傛暟鑾峰彇锛?
const roleId = ref(route.params.roleId);
// 瑙掕壊鍚嶇О锛堢敤浜庨〉闈㈡爣棰橈級
const roleName = ref('鏈煡瑙掕壊');

// 琛ㄦ牸鍔犺浇鐘舵€?
const tableLoading = ref(false);
// 鏃ュ織鍒楄〃鏁版嵁
const logList = ref([]);
// 鎼滅储琛ㄥ崟
const searchForm = reactive({
  operator: '',
  operationType: '',
  operationTime: [] // 鏃堕棿鑼冨洿锛歔寮€濮嬫棩鏈? 缁撴潫鏃ユ湡]
});
// 鍒嗛〉淇℃伅
const pageInfo = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 鎿嶄綔绫诲瀷涓枃鏄犲皠
const operationTypeMap = ref({
  ADD_ROLE: '鏂板瑙掕壊',
  EDIT_ROLE: '缂栬緫瑙掕壊',
  UPDATE_PERMISSION: '鍙樻洿鏉冮檺',
  ENABLE_ROLE: '鍚敤瑙掕壊',
  DISABLE_ROLE: '绂佺敤瑙掕壊'
});

// 鎿嶄綔绫诲瀷鏍囩鏍峰紡鏄犲皠
const tagTypeMap = ref({
  ADD_ROLE: 'primary',
  EDIT_ROLE: 'success',
  UPDATE_PERMISSION: 'warning',
  ENABLE_ROLE: 'info',
  DISABLE_ROLE: 'danger'
});

// 鑾峰彇鎿嶄綔绫诲瀷涓枃鍚嶇О
const getOperationTypeName = (type) => {
  return operationTypeMap.value[type] || type;
};

// 鑾峰彇鏍囩鏍峰紡
const getTagType = (type) => {
  return tagTypeMap.value[type] || 'default';
};

// 鑾峰彇瑙掕壊鍙樻洿鏃ュ織
const fetchRoleLog = async () => {
  try {
    tableLoading.value = true;
    // 鏋勯€犺姹傚弬鏁?
    const params = {
      roleId: roleId.value,
      operator: searchForm.operator,
      operationType: searchForm.operationType,
      startTime: searchForm.operationTime[0] || '',
      endTime: searchForm.operationTime[1] || '',
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize
    };
    const res = await getRoleLog(params);
    if (res.code === 200) {
      logList.value = res.data.list;
      pageInfo.total = res.data.total;
      // 璧嬪€艰鑹插悕绉帮紙浠庣涓€鏉℃棩蹇椾腑鑾峰彇锛屾垨鎺ュ彛杩斿洖锛?
      if (logList.value.length > 0 && !roleName.value) {
        roleName.value = logList.value[0].roleName || '鏈煡瑙掕壊';
      }
    } else {
      ElMessage.error(res.msg || '鑾峰彇瑙掕壊鍙樻洿鏃ュ織澶辫触');
    }
  } catch (error) {
    ElMessage.error('鑾峰彇瑙掕壊鍙樻洿鏃ュ織寮傚父');
    console.error(error);
  } finally {
    tableLoading.value = false;
  }
};

// 閲嶇疆鎼滅储
const resetSearch = () => {
  searchForm.operator = '';
  searchForm.operationType = '';
  searchForm.operationTime = [];
  pageInfo.currentPage = 1;
  fetchRoleLog();
};

// 鍒嗛〉澶у皬鍙樻洿
const handleSizeChange = (size) => {
  pageInfo.pageSize = size;
  fetchRoleLog();
};

// 褰撳墠椤靛彉鏇?
const handleCurrentChange = (page) => {
  pageInfo.currentPage = page;
  fetchRoleLog();
};

// 瀵煎嚭鏃ュ織
const exportLog = async () => {
  try {
    // 鏋勯€犲鍑哄弬鏁帮紙涓庢煡璇㈠弬鏁颁竴鑷达級
    const params = {
      roleId: roleId.value,
      operator: searchForm.operator,
      operationType: searchForm.operationType,
      startTime: searchForm.operationTime[0] || '',
      endTime: searchForm.operationTime[1] || ''
    };
    const res = await exportRoleLog(params, {
      responseType: 'blob' // 浜岃繘鍒舵祦鍝嶅簲
    });

    // 澶勭悊瀵煎嚭鏂囦欢锛堟祻瑙堝櫒涓嬭浇锛?
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `瑙掕壊${roleName.value}-鏉冮檺鍙樻洿鏃ュ織.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    ElMessage.success('鏃ュ織瀵煎嚭鎴愬姛');
  } catch (error) {
    ElMessage.error('鏃ュ織瀵煎嚭澶辫触');
    console.error(error);
  }
};

// 椤甸潰鎸傝浇鏃跺垵濮嬪寲鏃ュ織鍒楄〃
onMounted(() => {
  fetchRoleLog();
});
</script>

<style scoped>
.role-log-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-card {
  padding: 16px;
}

.table-card {
  padding: 0;
}

.ellipsis-text {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-content {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  color: #333;
}

.log-content-popover {
  max-height: 400px;
  overflow-y: auto;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>