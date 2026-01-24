
<template>
  <div class="activity-lifecycle-container">
    
    <div class="page-header">
      <h2 class="page-title">娲诲姩鍏ㄧ敓鍛藉懆鏈熺鐞?/h2>
      <div class="action-buttons">
        <el-button
            type="primary"
            icon="Plus"
            @click="openAddActivityDialog"
            class="btn-primary"
        >
          鍙戝竷鏂版椿鍔?
        </el-button>
        <el-button
            type="warning"
            icon="Edit"
            @click="batchEditActivity"
            :disabled="selectedActivityIds.length === 0"
        >
          鎵归噺缂栬緫
        </el-button>
        <el-button
            type="danger"
            icon="Delete"
            @click="batchOfflineActivity"
            :disabled="selectedActivityIds.length === 0"
        >
          鎵归噺涓嬫灦
        </el-button>
      </div>
    </div>

    
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline @submit.prevent="handleSearch">
        <el-form-item label="娲诲姩鍚嶇О">
          <el-input
              v-model="searchForm.activityName"
              placeholder="璇疯緭鍏ユ椿鍔ㄥ悕绉板叧閿瘝"
              clearable
              style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="娲诲姩绫诲瀷">
          <el-select
              v-model="searchForm.activityType"
              placeholder="璇烽€夋嫨娲诲姩绫诲瀷"
              clearable
              style="width: 150px;"
          >
            <el-option label="瀛︽湳娲诲姩" value="ACADEMIC" />
            <el-option label="鏂囦綋娲诲姩" value="CULTURE_SPORTS" />
            <el-option label="蹇楁効娲诲姩" value="VOLUNTEER" />
            <el-option label="瀹炶返娲诲姩" value="PRACTICE" />
            <el-option label="鍏朵粬娲诲姩" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="娲诲姩鐘舵€?>
          <el-select
              v-model="searchForm.activityStatus"
              placeholder="璇烽€夋嫨娲诲姩鐘舵€?
              clearable
              style="width: 150px;"
          >
            <el-option label="鑽夌" value="DRAFT" />
            <el-option label="寰呭鏍? value="PENDING_AUDIT" />
            <el-option label="宸插彂甯? value="PUBLISHED" />
            <el-option label="宸蹭笅鏋? value="OFFLINE" />
          </el-select>
        </el-form-item>
        <el-form-item label="璐熻矗闄㈢郴">
          <el-select
              v-model="searchForm.deptName"
              placeholder="璇烽€夋嫨璐熻矗闄㈢郴"
              clearable
              style="width: 150px;"
          >
            <el-option label="璁＄畻鏈哄闄? value="璁＄畻鏈哄闄? />
            <el-option label="鏂囧闄? value="鏂囧闄? />
            <el-option label="鏍″洟濮? value="鏍″洟濮? />
            <el-option label="鏍″鐢熶細" value="鏍″鐢熶細" />
            <el-option label="鍏朵粬閮ㄩ棬" value="鍏朵粬閮ㄩ棬" />
          </el-select>
        </el-form-item>
        <el-form-item label="鏃堕棿鑼冨洿">
          <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="鑷?
              start-placeholder="寮€濮嬫棩鏈?
              end-placeholder="缁撴潫鏃ユ湡"
              style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">鎼滅储</el-button>
          <el-button icon="Refresh" @click="resetSearchForm">閲嶇疆</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card class="list-card" shadow="hover">
      <el-table
          :data="activityList"
          border
          stripe
          @selection-change="handleSelectionChange"
          row-key="activityId"
          v-loading="tableLoading"
          style="width: 100%;"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="activityId" label="娲诲姩ID" width="80" align="center" />
        <el-table-column prop="title" label="娲诲姩鍚嶇О" min-width="200" />
        <el-table-column prop="type" label="娲诲姩绫诲瀷" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getActivityTypeTag(scope.row.type)">
              {{ getActivityTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="绗簩璇惧爞鍒嗗€? width="120" align="center" />
        <el-table-column prop="deptName" label="璐熻矗闄㈢郴" width="120" align="center" />
        <el-table-column prop="status" label="娲诲姩鐘舵€? width="100" align="center">
          <template #default="scope">
            <el-tag :type="getActivityStatusTag(scope.row.status)">
              {{ getActivityStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="寮€濮嬫椂闂? width="180" align="center" />
        <el-table-column prop="endTime" label="缁撴潫鏃堕棿" width="180" align="center" />
        <el-table-column label="鎿嶄綔" width="300" align="center">
          <template #default="scope">
            <el-button
                size="small"
                type="primary"
                icon="Edit"
                @click="openEditActivityDialog(scope.row)"
                :disabled="scope.row.status === 'PUBLISHED' || scope.row.status === 'OFFLINE'"
            >
              缂栬緫
            </el-button>
            <el-button
                size="small"
                type="success"
                icon="Check"
                @click="submitActivityAudit(scope.row)"
                v-if="scope.row.status === 'DRAFT'"
            >
              鎻愪氦瀹℃牳
            </el-button>
            <el-button
                size="small"
                type="warning"
                icon="Minus"
                @click="offlineSingleActivity(scope.row)"
                v-if="scope.row.status === 'PUBLISHED'"
            >
              涓嬫灦
            </el-button>
            <el-button
                size="small"
                type="info"
                icon="View"
                @click="viewActivityDetail(scope.row)"
            >
              璇︽儏
            </el-button>
            <el-button
                size="small"
                type="danger"
                icon="Delete"
                @click="deleteSingleActivity(scope.row)"
                v-if="scope.row.status === 'DRAFT' || scope.row.status === 'OFFLINE'"
            >
              鍒犻櫎
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      
      <div class="pagination-container">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            background
        >
        </el-pagination>
      </div>
    </el-card>

    
    <el-dialog
        :title="isEdit ? '缂栬緫娲诲姩' : '鍙戝竷鏂版椿鍔?"
        v-model="activityDialogVisible"
        width="850px"
        top="20px"
        destroy-on-close
    >
      <el-form
          :model="activityForm"
          :rules="activityFormRules"
          ref="activityFormRef"
          label-width="100px"
          label-position="left"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="娲诲姩鍚嶇О" prop="title">
              <el-input
                  v-model="activityForm.title"
                  placeholder="璇疯緭鍏ユ椿鍔ㄥ悕绉帮紙涓嶈秴杩?0瀛楋級"
                  maxlength="50"
                  show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="娲诲姩绫诲瀷" prop="type">
              <el-select v-model="activityForm.type" placeholder="璇烽€夋嫨娲诲姩绫诲瀷">
                <el-option label="瀛︽湳娲诲姩" value="ACADEMIC" />
                <el-option label="鏂囦綋娲诲姩" value="CULTURE_SPORTS" />
                <el-option label="蹇楁効娲诲姩" value="VOLUNTEER" />
                <el-option label="瀹炶返娲诲姩" value="PRACTICE" />
                <el-option label="鍏朵粬娲诲姩" value="OTHER" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="绗簩璇惧爞鍒嗗€? prop="score">
              <el-input
                  v-model="activityForm.score"
                  type="number"
                  placeholder="璇疯緭鍏ュ垎鍊硷紙0-100锛?
                  min="0"
                  max="100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="璐熻矗闄㈢郴" prop="deptName">
              <el-select v-model="activityForm.deptName" placeholder="璇烽€夋嫨璐熻矗闄㈢郴">
                <el-option label="璁＄畻鏈哄闄? value="璁＄畻鏈哄闄? />
                <el-option label="鏂囧闄? value="鏂囧闄? />
                <el-option label="鏍″洟濮? value="鏍″洟濮? />
                <el-option label="鏍″鐢熶細" value="鏍″鐢熶細" />
                <el-option label="鍏朵粬閮ㄩ棬" value="鍏朵粬閮ㄩ棬" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="娲诲姩寮€濮嬫椂闂? prop="startTime">
              <el-date-picker
                  v-model="activityForm.startTime"
                  type="datetime"
                  placeholder="閫夋嫨娲诲姩寮€濮嬫椂闂?
                  style="width: 100%;"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="娲诲姩缁撴潫鏃堕棿" prop="endTime">
              <el-date-picker
                  v-model="activityForm.endTime"
                  type="datetime"
                  placeholder="閫夋嫨娲诲姩缁撴潫鏃堕棿"
                  style="width: 100%;"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="娲诲姩鍦扮偣" prop="location">
          <el-input
              v-model="activityForm.location"
              placeholder="璇疯緭鍏ユ椿鍔ㄥ湴鐐癸紙濡傦細璁＄畻鏈哄闄㈡姤鍛婂巺銆佸鏍″ぇ绀煎爞锛?
          />
        </el-form-item>

        <el-form-item label="鎶ュ悕鏉′欢" prop="applyCondition">
          <el-input
              v-model="activityForm.applyCondition"
              type="textarea"
              placeholder="璇疯緭鍏ユ姤鍚嶆潯浠讹紙濡傦細浠呴檺澶т竴瀛︾敓銆侀渶鎻愪氦绠€鍘嗙瓑锛?
              rows="3"
          />
        </el-form-item>

        <el-form-item label="娲诲姩璇︽儏" prop="content">
          <el-input
              v-model="activityForm.content"
              type="textarea"
              placeholder="璇疯缁嗘弿杩版椿鍔ㄥ唴瀹广€佹祦绋嬨€佽姹傜瓑"
              rows="6"
          />
        </el-form-item>

        <el-form-item label="娲诲姩闄勪欢">
          <el-upload
              class="upload-component"
              action="#"
              :auto-upload="false"
              :file-list="activityForm.fileList"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
          >
            <el-button type="primary" icon="Upload">鐐瑰嚮涓婁紶闄勪欢</el-button>
            <div class="el-upload__tip" slot="tip">
              鏀寔PDF/Word/鍥剧墖鏍煎紡锛屽崟鏂囦欢鈮?0MB锛屾渶澶氫笂浼?涓枃浠?
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="activityDialogVisible = false">鍙栨秷</el-button>
        <el-button
            type="primary"
            @click="saveActivityAsDraft"
            v-if="!isEdit"
        >
          淇濆瓨涓鸿崏绋?
        </el-button>
        <el-button
            type="success"
            @click="saveAndSubmitActivity"
        >
          {{ isEdit ? '鏇存柊娲诲姩' : '淇濆瓨骞舵彁浜ゅ鏍? }}
        </el-button>
      </template>
    </el-dialog>

    
    <el-dialog
        title="娲诲姩璇︽儏"
        v-model="detailDialogVisible"
        width="800px"
        top="20px"
    >
      <div v-if="currentActivity" class="activity-detail">
        <div class="detail-row">
          <span class="detail-label">娲诲姩ID锛?/span>
          <span class="detail-value">{{ currentActivity.activityId }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">娲诲姩鍚嶇О锛?/span>
          <span class="detail-value">{{ currentActivity.title }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">娲诲姩绫诲瀷锛?/span>
          <span class="detail-value">{{ getActivityTypeName(currentActivity.type) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">绗簩璇惧爞鍒嗗€硷細</span>
          <span class="detail-value">{{ currentActivity.score }}鍒?/span>
        </div>
        <div class="detail-row">
          <span class="detail-label">璐熻矗闄㈢郴锛?/span>
          <span class="detail-value">{{ currentActivity.deptName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">娲诲姩鐘舵€侊細</span>
          <span class="detail-value">
            <el-tag :type="getActivityStatusTag(currentActivity.status)">
              {{ getActivityStatusName(currentActivity.status) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">娲诲姩鏃堕棿锛?/span>
          <span class="detail-value">{{ currentActivity.startTime }} 鑷?{{ currentActivity.endTime }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">娲诲姩鍦扮偣锛?/span>
          <span class="detail-value">{{ currentActivity.location }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">鎶ュ悕鏉′欢锛?/span>
          <span class="detail-value">{{ currentActivity.applyCondition }}</span>
        </div>
        <div class="detail-row detail-content">
          <span class="detail-label">娲诲姩璇︽儏锛?/span>
          <div class="detail-value">{{ currentActivity.content }}</div>
        </div>
        <div class="detail-row" v-if="currentActivity.fileList && currentActivity.fileList.length > 0">
          <span class="detail-label">娲诲姩闄勪欢锛?/span>
          <div class="detail-value">
            <el-tag
                v-for="(file, index) in currentActivity.fileList"
                :key="index"
                closable
                style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ file.name }}
            </el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">鍏抽棴</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ========== 鍩虹鏁版嵁瀹氫箟 ==========
// 娲诲姩鍒楄〃妯℃嫙鏁版嵁
const activityList = ref([
  {
    activityId: 1001,
    title: "2026鏍″洯缂栫▼鍒涙柊澶ц禌",
    type: "ACADEMIC",
    score: 15,
    deptName: "璁＄畻鏈哄闄?,
    status: "PUBLISHED",
    startTime: "2026-03-15 14:00:00",
    endTime: "2026-03-30 18:00:00",
    location: "璁＄畻鏈哄闄?鍙锋姤鍛婂巺",
    applyCondition: "鍏ㄦ牎鏈鐢熷潎鍙姤鍚嶏紝闇€鎻愪氦缂栫▼浣滃搧鍒濈",
    content: "鏈缂栫▼澶ц禌浠?AI+鏍″洯'涓轰富棰橈紝璁剧疆Python銆丣ava銆丆++涓変釜璧涢亾锛屼竴绛夊鍙幏寰楃浜岃鍫?5鍒嗭紝骞舵湁鏈轰細鎺ㄨ崘鍙傚姞鐪佺骇姣旇禌銆傛瘮璧涘垎涓哄垵璧涖€佸璧涖€佸喅璧涗笁涓樁娈碉紝鍒濊禌涓虹嚎涓婃彁浜や綔鍝侊紝澶嶈禌鍜屽喅璧涗负绾夸笅绛旇京銆?,
    fileList: [{ name: "缂栫▼澶ц禌瑙勫垯.pdf" }, { name: "寰€灞婁紭绉€浣滃搧鍙傝€?zip" }]
  },
  {
    activityId: 1002,
    title: "3路12妞嶆爲鑺傚織鎰挎椿鍔?,
    type: "VOLUNTEER",
    score: 8,
    deptName: "鏍″洟濮?,
    status: "PENDING_AUDIT",
    startTime: "2026-03-12 09:00:00",
    endTime: "2026-03-12 12:00:00",
    location: "鏍″洯瑗垮尯缁垮湴",
    applyCondition: "浠呴檺澶т竴銆佸ぇ浜屽鐢燂紝闇€韬綋鍋ュ悍锛岃兘鍙備笌浣撳姏鍔冲姩",
    content: "鍝嶅簲妞嶆爲鑺傚彿鍙紝缁勭粐瀛︾敓鍙備笌鏍″洯妞嶆爲娲诲姩锛屾瘡浜鸿礋璐?-2妫垫爲鑻楃殑绉嶆鍜屽吇鎶わ紝瀹屾垚娲诲姩鍙幏寰?鍒嗗織鎰垮垎銆傛椿鍔ㄦ彁渚涘伐鍏峰拰鏍戣嫍锛岄泦鍚堝湴鐐逛负瀛︽牎瑗块棬骞垮満锛?鐐瑰噯鏃跺嚭鍙戙€?,
    fileList: [{ name: "妞嶆爲娲诲姩瀹夊叏椤荤煡.docx" }]
  },
  {
    activityId: 1003,
    title: "鏍″洯璇楁瓕鏈楄澶ц禌",
    type: "CULTURE_SPORTS",
    score: 10,
    deptName: "鏂囧闄?,
    status: "DRAFT",
    startTime: "2026-04-05 19:00:00",
    endTime: "2026-04-05 21:30:00",
    location: "瀛︽牎澶хぜ鍫?,
    applyCondition: "浠?闈掓槬涓庢ⅵ鎯?涓轰富棰橈紝鏂囧闄㈠鐢熶紭鍏堬紝鍏朵粬闄㈢郴鍙姤鍚?,
    content: "鏈楄澶ц禌鍒嗕负鍒濊禌鍜屽喅璧涳紝鍒濊禌涓洪櫌绾ч€夋嫈锛屽喅璧涗负鏍＄骇璇勬瘮銆傝瘎濮斿皢浠庤闊宠璋冦€佹儏鎰熻〃杈俱€佸唴瀹圭悊瑙ｃ€佸彴椋庡舰璞″洓涓淮搴︽墦鍒嗭紝鑾峰閫夋墜鍙幏寰楃浜岃鍫傚垎鍊煎鍔便€?,
    fileList: []
  },
  {
    activityId: 1004,
    title: "鏆戞湡绀句細瀹炶返椤圭洰鐢虫姤",
    type: "PRACTICE",
    score: 20,
    deptName: "鏍″鐢熶細",
    status: "OFFLINE",
    startTime: "2026-05-01 00:00:00",
    endTime: "2026-08-31 23:59:59",
    location: "鍏ㄥ浗鍚勫湴瀹炶返鍩哄湴",
    applyCondition: "澶т笁銆佸ぇ鍥涘鐢燂紝闇€浠ュ洟闃熷舰寮忕敵鎶ワ紝姣忕粍3-5浜?,
    content: "鏆戞湡绀句細瀹炶返鍥寸粫涔℃潙鎸叴銆佺ぞ鍖烘湇鍔°€佷紒涓氬疄涔犵瓑鏂瑰悜寮€灞曪紝鐢虫姤鎴愬姛鐨勫洟闃熷彲鑾峰緱缁忚垂鏀寔锛屽畬鎴愬疄璺靛苟鎻愪氦鎶ュ憡鑰呭彲鑾峰緱20鍒嗗疄璺靛垎銆?,
    fileList: [{ name: "绀句細瀹炶返鐢虫姤妯℃澘.docx" }, { name: "瀹炶返鍩哄湴鍒楄〃.xlsx" }]
  }
])

// 鍒嗛〉鍙傛暟
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: activityList.value.length
})

// 鎼滅储琛ㄥ崟
const searchForm = reactive({
  activityName: "",
  activityType: "",
  activityStatus: "",
  deptName: "",
  timeRange: []
})

// 閫変腑鐨勬椿鍔↖D锛堟壒閲忔搷浣滐級
const selectedActivityIds = ref([])

// 寮圭獥鎺у埗
const activityDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const tableLoading = ref(false)

// 褰撳墠鎿嶄綔鐨勬椿鍔?
const currentActivity = ref({})

// 娲诲姩琛ㄥ崟
const activityFormRef = ref(null)
const activityForm = reactive({
  title: "",
  type: "",
  score: "",
  deptName: "",
  startTime: "",
  endTime: "",
  location: "",
  applyCondition: "",
  content: "",
  fileList: []
})

// 琛ㄥ崟鏍￠獙瑙勫垯
const activityFormRules = reactive({
  title: [{ required: true, message: "璇疯緭鍏ユ椿鍔ㄥ悕绉?, trigger: "blur" }],
  type: [{ required: true, message: "璇烽€夋嫨娲诲姩绫诲瀷", trigger: "change" }],
  score: [
    { required: true, message: "璇疯緭鍏ョ浜岃鍫傚垎鍊?, trigger: "blur" },
    { type: "number", min: 0, max: 100, message: "鍒嗗€奸渶鍦?-100涔嬮棿", trigger: "blur" }
  ],
  deptName: [{ required: true, message: "璇烽€夋嫨璐熻矗闄㈢郴", trigger: "change" }],
  startTime: [{ required: true, message: "璇烽€夋嫨娲诲姩寮€濮嬫椂闂?, trigger: "change" }],
  endTime: [{ required: true, message: "璇烽€夋嫨娲诲姩缁撴潫鏃堕棿", trigger: "change" }],
  location: [{ required: true, message: "璇疯緭鍏ユ椿鍔ㄥ湴鐐?, trigger: "blur" }],
  applyCondition: [{ required: true, message: "璇疯緭鍏ユ姤鍚嶆潯浠?, trigger: "blur" }],
  content: [{ required: true, message: "璇疯緭鍏ユ椿鍔ㄨ鎯?, trigger: "blur" }]
})

// ========== 宸ュ叿鏂规硶 ==========
// 鑾峰彇娲诲姩绫诲瀷鍚嶇О
const getActivityTypeName = (type) => {
  const typeMap = {
    ACADEMIC: "瀛︽湳娲诲姩",
    CULTURE_SPORTS: "鏂囦綋娲诲姩",
    VOLUNTEER: "蹇楁効娲诲姩",
    PRACTICE: "瀹炶返娲诲姩",
    OTHER: "鍏朵粬娲诲姩"
  }
  return typeMap[type] || "鏈煡绫诲瀷"
}

// 鑾峰彇娲诲姩绫诲瀷鏍囩鏍峰紡
const getActivityTypeTag = (type) => {
  const tagMap = {
    ACADEMIC: "primary",
    CULTURE_SPORTS: "success",
    VOLUNTEER: "warning",
    PRACTICE: "info",
    OTHER: "default"
  }
  return tagMap[type] || "primary"
}

// 鑾峰彇娲诲姩鐘舵€佸悕绉?
const getActivityStatusName = (status) => {
  const statusMap = {
    DRAFT: "鑽夌",
    PENDING_AUDIT: "寰呭鏍?,
    PUBLISHED: "宸插彂甯?,
    OFFLINE: "宸蹭笅鏋?
  }
  return statusMap[status] || "鏈煡鐘舵€?
}

// 鑾峰彇娲诲姩鐘舵€佹爣绛炬牱寮?
const getActivityStatusTag = (status) => {
  const tagMap = {
    DRAFT: "info",
    PENDING_AUDIT: "warning",
    PUBLISHED: "success",
    OFFLINE: "danger"
  }
  return tagMap[status] || "info"
}

// ========== 浜嬩欢澶勭悊 ==========
// 琛ㄦ牸閫夋嫨浜嬩欢
const handleSelectionChange = (val) => {
  selectedActivityIds.value = val.map(item => item.activityId)
}

// 鍒嗛〉澶у皬鍙樻洿
const handleSizeChange = (val) => {
  pagination.pageSize = val
}

// 鍒嗛〉椤电爜鍙樻洿
const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

// 鎼滅储浜嬩欢
const handleSearch = () => {
  tableLoading.value = true
  // 妯℃嫙鎺ュ彛璇锋眰寤惰繜
  setTimeout(() => {
    // 杩欓噷鍙浛鎹负鐪熷疄鎺ュ彛璇锋眰閫昏緫
    ElMessage.success("鎼滅储鎴愬姛")
    tableLoading.value = false
  }, 500)
}

// 閲嶇疆鎼滅储琛ㄥ崟
const resetSearchForm = () => {
  Object.assign(searchForm, {
    activityName: "",
    activityType: "",
    activityStatus: "",
    deptName: "",
    timeRange: []
  })
  ElMessage.info("鎼滅储鏉′欢宸查噸缃?)
}

// 鎵撳紑鏂板娲诲姩寮圭獥
const openAddActivityDialog = () => {
  isEdit.value = false
  // 閲嶇疆琛ㄥ崟
  activityFormRef.value?.resetFields()
  Object.assign(activityForm, {
    title: "",
    type: "",
    score: "",
    deptName: "",
    startTime: "",
    endTime: "",
    location: "",
    applyCondition: "",
    content: "",
    fileList: []
  })
  activityDialogVisible.value = true
}

// 鎵撳紑缂栬緫娲诲姩寮圭獥
const openEditActivityDialog = (row) => {
  isEdit.value = true
  currentActivity.value = row
  // 濉厖琛ㄥ崟
  Object.assign(activityForm, {
    title: row.title,
    type: row.type,
    score: row.score,
    deptName: row.deptName,
    startTime: row.startTime,
    endTime: row.endTime,
    location: row.location,
    applyCondition: row.applyCondition,
    content: row.content,
    fileList: row.fileList || []
  })
  activityDialogVisible.value = true
}

// 淇濆瓨涓鸿崏绋?
const saveActivityAsDraft = () => {
  activityFormRef.value.validate((valid) => {
    if (valid) {
      // 妯℃嫙淇濆瓨鑽夌閫昏緫
      const newActivity = {
        activityId: Math.floor(Math.random() * 10000),
        ...activityForm,
        status: "DRAFT"
      }
      activityList.value.unshift(newActivity)
      pagination.total = activityList.value.length
      activityDialogVisible.value = false
      ElMessage.success("娲诲姩宸蹭繚瀛樹负鑽夌")
    }
  })
}

// 淇濆瓨骞舵彁浜ゅ鏍?鏇存柊娲诲姩
const saveAndSubmitActivity = () => {
  activityFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 缂栬緫閫昏緫
        const index = activityList.value.findIndex(item => item.activityId === currentActivity.value.activityId)
        if (index > -1) {
          activityList.value[index] = { ...activityList.value[index], ...activityForm }
        }
        ElMessage.success("娲诲姩鏇存柊鎴愬姛")
      } else {
        // 鏂板骞舵彁浜ゅ鏍?
        const newActivity = {
          activityId: Math.floor(Math.random() * 10000),
          ...activityForm,
          status: "PENDING_AUDIT"
        }
        activityList.value.unshift(newActivity)
        pagination.total = activityList.value.length
        ElMessage.success("娲诲姩鎻愪氦瀹℃牳鎴愬姛锛岀瓑寰呴櫌绯荤鐞嗗憳瀹℃牳")
      }
      activityDialogVisible.value = false
    }
  })
}

// 鎻愪氦瀹℃牳
const submitActivityAudit = (row) => {
  ElMessageBox.confirm(
      `纭畾瑕佹彁浜ゃ€?{row.title}銆戠殑瀹℃牳鐢宠鍚楋紵鎻愪氦鍚庡皢鏃犳硶缂栬緫`,
      "鎻愪氦瀹℃牳",
      {
        confirmButtonText: "纭畾",
        cancelButtonText: "鍙栨秷",
        type: "warning"
      }
  ).then(() => {
    row.status = "PENDING_AUDIT"
    ElMessage.success("瀹℃牳鐢宠鎻愪氦鎴愬姛")
  })
}

// 鍗曚釜娲诲姩涓嬫灦
const offlineSingleActivity = (row) => {
  ElMessageBox.confirm(
      `纭畾瑕佷笅鏋躲€?{row.title}銆戝悧锛熶笅鏋跺悗瀛︾敓灏嗘棤娉曟姤鍚嶅弬涓巂,
      "涓嬫灦娲诲姩",
      {
        confirmButtonText: "纭畾",
        cancelButtonText: "鍙栨秷",
        type: "danger"
      }
  ).then(() => {
    row.status = "OFFLINE"
    ElMessage.success("娲诲姩宸蹭笅鏋?)
  })
}

// 鎵归噺缂栬緫
const batchEditActivity = () => {
  ElMessage.info("鎵归噺缂栬緫鍔熻兘鏆傛湭寮€鏀撅紝寤鸿鍗曠嫭缂栬緫娲诲姩")
}

// 鎵归噺涓嬫灦
const batchOfflineActivity = () => {
  ElMessageBox.confirm(
      `纭畾瑕佷笅鏋堕€変腑鐨?{selectedActivityIds.value.length}涓椿鍔ㄥ悧锛焋,
      "鎵归噺涓嬫灦",
      {
        confirmButtonText: "纭畾",
        cancelButtonText: "鍙栨秷",
        type: "danger"
      }
  ).then(() => {
    activityList.value.forEach(item => {
      if (selectedActivityIds.value.includes(item.activityId)) {
        item.status = "OFFLINE"
      }
    })
    selectedActivityIds.value = []
    ElMessage.success("鎵归噺涓嬫灦鎴愬姛")
  })
}

// 鏌ョ湅娲诲姩璇︽儏
const viewActivityDetail = (row) => {
  currentActivity.value = row
  detailDialogVisible.value = true
}

// 鍒犻櫎鍗曚釜娲诲姩
const deleteSingleActivity = (row) => {
  ElMessageBox.confirm(
      `纭畾瑕佸垹闄ゃ€?{row.title}銆戝悧锛熷垹闄ゅ悗鏁版嵁灏嗘棤娉曟仮澶峘,
      "鍒犻櫎娲诲姩",
      {
        confirmButtonText: "纭畾",
        cancelButtonText: "鍙栨秷",
        type: "danger"
      }
  ).then(() => {
    activityList.value = activityList.value.filter(item => item.activityId !== row.activityId)
    pagination.total = activityList.value.length
    ElMessage.success("娲诲姩鍒犻櫎鎴愬姛")
  })
}

// 椤甸潰鍒濆鍖?
onMounted(() => {
  // 妯℃嫙鍒濆鍔犺浇
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
  }, 300)
})
</script>

<style scoped>
.activity-lifecycle-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

/* 椤甸潰澶撮儴 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background-color: #409eff;
  border-color: #409eff;
}

/* 鎼滅储鍗＄墖 */
.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 鍒楄〃鍗＄墖 */
.list-card {
  border-radius: 8px;
}

/* 鍒嗛〉 */
.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 璇︽儏寮圭獥鏍峰紡 */
.activity-detail {
  padding: 10px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.detail-label {
  width: 100px;
  color: #666;
  font-weight: 600;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-content .detail-value {
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 涓婁紶缁勪欢 */
.upload-component {
  margin-top: 5px;
}
</style>