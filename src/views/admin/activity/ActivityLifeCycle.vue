<!-- src/views/admin/activity/ActivityLifeCycle.vue -->
<template>
  <div class="activity-lifecycle-container">
    <!-- 页面头部：标题 + 操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">活动全生命周期管理</h2>
      <div class="action-buttons">
        <el-button
            type="primary"
            icon="Plus"
            @click="openAddActivityDialog"
            class="btn-primary"
        >
          发布新活动
        </el-button>
        <el-button
            type="warning"
            icon="Edit"
            @click="batchEditActivity"
            :disabled="selectedActivityIds.length === 0"
        >
          批量编辑
        </el-button>
        <el-button
            type="danger"
            icon="Delete"
            @click="batchOfflineActivity"
            :disabled="selectedActivityIds.length === 0"
        >
          批量下架
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline @submit.prevent="handleSearch">
        <el-form-item label="活动名称">
          <el-input
              v-model="searchForm.activityName"
              placeholder="请输入活动名称关键词"
              clearable
              style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select
              v-model="searchForm.activityType"
              placeholder="请选择活动类型"
              clearable
              style="width: 150px;"
          >
            <el-option label="学术活动" value="ACADEMIC" />
            <el-option label="文体活动" value="CULTURE_SPORTS" />
            <el-option label="志愿活动" value="VOLUNTEER" />
            <el-option label="实践活动" value="PRACTICE" />
            <el-option label="其他活动" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select
              v-model="searchForm.activityStatus"
              placeholder="请选择活动状态"
              clearable
              style="width: 150px;"
          >
            <el-option label="草稿" value="DRAFT" />
            <el-option label="待审核" value="PENDING_AUDIT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已下架" value="OFFLINE" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责院系">
          <el-select
              v-model="searchForm.deptName"
              placeholder="请选择负责院系"
              clearable
              style="width: 150px;"
          >
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="文学院" value="文学院" />
            <el-option label="校团委" value="校团委" />
            <el-option label="校学生会" value="校学生会" />
            <el-option label="其他部门" value="其他部门" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 活动列表区域 -->
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
        <el-table-column prop="activityId" label="活动ID" width="80" align="center" />
        <el-table-column prop="title" label="活动名称" min-width="200" />
        <el-table-column prop="type" label="活动类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getActivityTypeTag(scope.row.type)">
              {{ getActivityTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="第二课堂分值" width="120" align="center" />
        <el-table-column prop="deptName" label="负责院系" width="120" align="center" />
        <el-table-column prop="status" label="活动状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getActivityStatusTag(scope.row.status)">
              {{ getActivityStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" align="center" />
        <el-table-column prop="endTime" label="结束时间" width="180" align="center" />
        <el-table-column label="操作" width="300" align="center">
          <template #default="scope">
            <el-button
                size="small"
                type="primary"
                icon="Edit"
                @click="openEditActivityDialog(scope.row)"
                :disabled="scope.row.status === 'PUBLISHED' || scope.row.status === 'OFFLINE'"
            >
              编辑
            </el-button>
            <el-button
                size="small"
                type="success"
                icon="Check"
                @click="submitActivityAudit(scope.row)"
                v-if="scope.row.status === 'DRAFT'"
            >
              提交审核
            </el-button>
            <el-button
                size="small"
                type="warning"
                icon="Minus"
                @click="offlineSingleActivity(scope.row)"
                v-if="scope.row.status === 'PUBLISHED'"
            >
              下架
            </el-button>
            <el-button
                size="small"
                type="info"
                icon="View"
                @click="viewActivityDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button
                size="small"
                type="danger"
                icon="Delete"
                @click="deleteSingleActivity(scope.row)"
                v-if="scope.row.status === 'DRAFT' || scope.row.status === 'OFFLINE'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
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

    <!-- 新增/编辑活动弹窗 -->
    <el-dialog
        :title="isEdit ? '编辑活动' : '发布新活动'"
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
            <el-form-item label="活动名称" prop="title">
              <el-input
                  v-model="activityForm.title"
                  placeholder="请输入活动名称（不超过50字）"
                  maxlength="50"
                  show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型" prop="type">
              <el-select v-model="activityForm.type" placeholder="请选择活动类型">
                <el-option label="学术活动" value="ACADEMIC" />
                <el-option label="文体活动" value="CULTURE_SPORTS" />
                <el-option label="志愿活动" value="VOLUNTEER" />
                <el-option label="实践活动" value="PRACTICE" />
                <el-option label="其他活动" value="OTHER" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="第二课堂分值" prop="score">
              <el-input
                  v-model="activityForm.score"
                  type="number"
                  placeholder="请输入分值（0-100）"
                  min="0"
                  max="100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责院系" prop="deptName">
              <el-select v-model="activityForm.deptName" placeholder="请选择负责院系">
                <el-option label="计算机学院" value="计算机学院" />
                <el-option label="文学院" value="文学院" />
                <el-option label="校团委" value="校团委" />
                <el-option label="校学生会" value="校学生会" />
                <el-option label="其他部门" value="其他部门" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动开始时间" prop="startTime">
              <el-date-picker
                  v-model="activityForm.startTime"
                  type="datetime"
                  placeholder="选择活动开始时间"
                  style="width: 100%;"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动结束时间" prop="endTime">
              <el-date-picker
                  v-model="activityForm.endTime"
                  type="datetime"
                  placeholder="选择活动结束时间"
                  style="width: 100%;"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动地点" prop="location">
          <el-input
              v-model="activityForm.location"
              placeholder="请输入活动地点（如：计算机学院报告厅、学校大礼堂）"
          />
        </el-form-item>

        <el-form-item label="报名条件" prop="applyCondition">
          <el-input
              v-model="activityForm.applyCondition"
              type="textarea"
              placeholder="请输入报名条件（如：仅限大一学生、需提交简历等）"
              rows="3"
          />
        </el-form-item>

        <el-form-item label="活动详情" prop="content">
          <el-input
              v-model="activityForm.content"
              type="textarea"
              placeholder="请详细描述活动内容、流程、要求等"
              rows="6"
          />
        </el-form-item>

        <el-form-item label="活动附件">
          <el-upload
              class="upload-component"
              action="#"
              :auto-upload="false"
              :file-list="activityForm.fileList"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
          >
            <el-button type="primary" icon="Upload">点击上传附件</el-button>
            <div class="el-upload__tip" slot="tip">
              支持PDF/Word/图片格式，单文件≤10MB，最多上传5个文件
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="activityDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="saveActivityAsDraft"
            v-if="!isEdit"
        >
          保存为草稿
        </el-button>
        <el-button
            type="success"
            @click="saveAndSubmitActivity"
        >
          {{ isEdit ? '更新活动' : '保存并提交审核' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 活动详情弹窗 -->
    <el-dialog
        title="活动详情"
        v-model="detailDialogVisible"
        width="800px"
        top="20px"
    >
      <div v-if="currentActivity" class="activity-detail">
        <div class="detail-row">
          <span class="detail-label">活动ID：</span>
          <span class="detail-value">{{ currentActivity.activityId }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">活动名称：</span>
          <span class="detail-value">{{ currentActivity.title }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">活动类型：</span>
          <span class="detail-value">{{ getActivityTypeName(currentActivity.type) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">第二课堂分值：</span>
          <span class="detail-value">{{ currentActivity.score }}分</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">负责院系：</span>
          <span class="detail-value">{{ currentActivity.deptName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">活动状态：</span>
          <span class="detail-value">
            <el-tag :type="getActivityStatusTag(currentActivity.status)">
              {{ getActivityStatusName(currentActivity.status) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">活动时间：</span>
          <span class="detail-value">{{ currentActivity.startTime }} 至 {{ currentActivity.endTime }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">活动地点：</span>
          <span class="detail-value">{{ currentActivity.location }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">报名条件：</span>
          <span class="detail-value">{{ currentActivity.applyCondition }}</span>
        </div>
        <div class="detail-row detail-content">
          <span class="detail-label">活动详情：</span>
          <div class="detail-value">{{ currentActivity.content }}</div>
        </div>
        <div class="detail-row" v-if="currentActivity.fileList && currentActivity.fileList.length > 0">
          <span class="detail-label">活动附件：</span>
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
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ========== 基础数据定义 ==========
// 活动列表模拟数据
const activityList = ref([
  {
    activityId: 1001,
    title: "2026校园编程创新大赛",
    type: "ACADEMIC",
    score: 15,
    deptName: "计算机学院",
    status: "PUBLISHED",
    startTime: "2026-03-15 14:00:00",
    endTime: "2026-03-30 18:00:00",
    location: "计算机学院1号报告厅",
    applyCondition: "全校本科生均可报名，需提交编程作品初稿",
    content: "本次编程大赛以'AI+校园'为主题，设置Python、Java、C++三个赛道，一等奖可获得第二课堂15分，并有机会推荐参加省级比赛。比赛分为初赛、复赛、决赛三个阶段，初赛为线上提交作品，复赛和决赛为线下答辩。",
    fileList: [{ name: "编程大赛规则.pdf" }, { name: "往届优秀作品参考.zip" }]
  },
  {
    activityId: 1002,
    title: "3·12植树节志愿活动",
    type: "VOLUNTEER",
    score: 8,
    deptName: "校团委",
    status: "PENDING_AUDIT",
    startTime: "2026-03-12 09:00:00",
    endTime: "2026-03-12 12:00:00",
    location: "校园西区绿地",
    applyCondition: "仅限大一、大二学生，需身体健康，能参与体力劳动",
    content: "响应植树节号召，组织学生参与校园植树活动，每人负责1-2棵树苗的种植和养护，完成活动可获得8分志愿分。活动提供工具和树苗，集合地点为学校西门广场，9点准时出发。",
    fileList: [{ name: "植树活动安全须知.docx" }]
  },
  {
    activityId: 1003,
    title: "校园诗歌朗诵大赛",
    type: "CULTURE_SPORTS",
    score: 10,
    deptName: "文学院",
    status: "DRAFT",
    startTime: "2026-04-05 19:00:00",
    endTime: "2026-04-05 21:30:00",
    location: "学校大礼堂",
    applyCondition: "以'青春与梦想'为主题，文学院学生优先，其他院系可报名",
    content: "朗诵大赛分为初赛和决赛，初赛为院级选拔，决赛为校级评比。评委将从语音语调、情感表达、内容理解、台风形象四个维度打分，获奖选手可获得第二课堂分值奖励。",
    fileList: []
  },
  {
    activityId: 1004,
    title: "暑期社会实践项目申报",
    type: "PRACTICE",
    score: 20,
    deptName: "校学生会",
    status: "OFFLINE",
    startTime: "2026-05-01 00:00:00",
    endTime: "2026-08-31 23:59:59",
    location: "全国各地实践基地",
    applyCondition: "大三、大四学生，需以团队形式申报，每组3-5人",
    content: "暑期社会实践围绕乡村振兴、社区服务、企业实习等方向开展，申报成功的团队可获得经费支持，完成实践并提交报告者可获得20分实践分。",
    fileList: [{ name: "社会实践申报模板.docx" }, { name: "实践基地列表.xlsx" }]
  }
])

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: activityList.value.length
})

// 搜索表单
const searchForm = reactive({
  activityName: "",
  activityType: "",
  activityStatus: "",
  deptName: "",
  timeRange: []
})

// 选中的活动ID（批量操作）
const selectedActivityIds = ref([])

// 弹窗控制
const activityDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const tableLoading = ref(false)

// 当前操作的活动
const currentActivity = ref({})

// 活动表单
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

// 表单校验规则
const activityFormRules = reactive({
  title: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择活动类型", trigger: "change" }],
  score: [
    { required: true, message: "请输入第二课堂分值", trigger: "blur" },
    { type: "number", min: 0, max: 100, message: "分值需在0-100之间", trigger: "blur" }
  ],
  deptName: [{ required: true, message: "请选择负责院系", trigger: "change" }],
  startTime: [{ required: true, message: "请选择活动开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择活动结束时间", trigger: "change" }],
  location: [{ required: true, message: "请输入活动地点", trigger: "blur" }],
  applyCondition: [{ required: true, message: "请输入报名条件", trigger: "blur" }],
  content: [{ required: true, message: "请输入活动详情", trigger: "blur" }]
})

// ========== 工具方法 ==========
// 获取活动类型名称
const getActivityTypeName = (type) => {
  const typeMap = {
    ACADEMIC: "学术活动",
    CULTURE_SPORTS: "文体活动",
    VOLUNTEER: "志愿活动",
    PRACTICE: "实践活动",
    OTHER: "其他活动"
  }
  return typeMap[type] || "未知类型"
}

// 获取活动类型标签样式
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

// 获取活动状态名称
const getActivityStatusName = (status) => {
  const statusMap = {
    DRAFT: "草稿",
    PENDING_AUDIT: "待审核",
    PUBLISHED: "已发布",
    OFFLINE: "已下架"
  }
  return statusMap[status] || "未知状态"
}

// 获取活动状态标签样式
const getActivityStatusTag = (status) => {
  const tagMap = {
    DRAFT: "info",
    PENDING_AUDIT: "warning",
    PUBLISHED: "success",
    OFFLINE: "danger"
  }
  return tagMap[status] || "info"
}

// ========== 事件处理 ==========
// 表格选择事件
const handleSelectionChange = (val) => {
  selectedActivityIds.value = val.map(item => item.activityId)
}

// 分页大小变更
const handleSizeChange = (val) => {
  pagination.pageSize = val
}

// 分页页码变更
const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

// 搜索事件
const handleSearch = () => {
  tableLoading.value = true
  // 模拟接口请求延迟
  setTimeout(() => {
    // 这里可替换为真实接口请求逻辑
    ElMessage.success("搜索成功")
    tableLoading.value = false
  }, 500)
}

// 重置搜索表单
const resetSearchForm = () => {
  Object.assign(searchForm, {
    activityName: "",
    activityType: "",
    activityStatus: "",
    deptName: "",
    timeRange: []
  })
  ElMessage.info("搜索条件已重置")
}

// 打开新增活动弹窗
const openAddActivityDialog = () => {
  isEdit.value = false
  // 重置表单
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

// 打开编辑活动弹窗
const openEditActivityDialog = (row) => {
  isEdit.value = true
  currentActivity.value = row
  // 填充表单
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

// 保存为草稿
const saveActivityAsDraft = () => {
  activityFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟保存草稿逻辑
      const newActivity = {
        activityId: Math.floor(Math.random() * 10000),
        ...activityForm,
        status: "DRAFT"
      }
      activityList.value.unshift(newActivity)
      pagination.total = activityList.value.length
      activityDialogVisible.value = false
      ElMessage.success("活动已保存为草稿")
    }
  })
}

// 保存并提交审核/更新活动
const saveAndSubmitActivity = () => {
  activityFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑逻辑
        const index = activityList.value.findIndex(item => item.activityId === currentActivity.value.activityId)
        if (index > -1) {
          activityList.value[index] = { ...activityList.value[index], ...activityForm }
        }
        ElMessage.success("活动更新成功")
      } else {
        // 新增并提交审核
        const newActivity = {
          activityId: Math.floor(Math.random() * 10000),
          ...activityForm,
          status: "PENDING_AUDIT"
        }
        activityList.value.unshift(newActivity)
        pagination.total = activityList.value.length
        ElMessage.success("活动提交审核成功，等待院系管理员审核")
      }
      activityDialogVisible.value = false
    }
  })
}

// 提交审核
const submitActivityAudit = (row) => {
  ElMessageBox.confirm(
      `确定要提交【${row.title}】的审核申请吗？提交后将无法编辑`,
      "提交审核",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
  ).then(() => {
    row.status = "PENDING_AUDIT"
    ElMessage.success("审核申请提交成功")
  })
}

// 单个活动下架
const offlineSingleActivity = (row) => {
  ElMessageBox.confirm(
      `确定要下架【${row.title}】吗？下架后学生将无法报名参与`,
      "下架活动",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "danger"
      }
  ).then(() => {
    row.status = "OFFLINE"
    ElMessage.success("活动已下架")
  })
}

// 批量编辑
const batchEditActivity = () => {
  ElMessage.info("批量编辑功能暂未开放，建议单独编辑活动")
}

// 批量下架
const batchOfflineActivity = () => {
  ElMessageBox.confirm(
      `确定要下架选中的${selectedActivityIds.value.length}个活动吗？`,
      "批量下架",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "danger"
      }
  ).then(() => {
    activityList.value.forEach(item => {
      if (selectedActivityIds.value.includes(item.activityId)) {
        item.status = "OFFLINE"
      }
    })
    selectedActivityIds.value = []
    ElMessage.success("批量下架成功")
  })
}

// 查看活动详情
const viewActivityDetail = (row) => {
  currentActivity.value = row
  detailDialogVisible.value = true
}

// 删除单个活动
const deleteSingleActivity = (row) => {
  ElMessageBox.confirm(
      `确定要删除【${row.title}】吗？删除后数据将无法恢复`,
      "删除活动",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "danger"
      }
  ).then(() => {
    activityList.value = activityList.value.filter(item => item.activityId !== row.activityId)
    pagination.total = activityList.value.length
    ElMessage.success("活动删除成功")
  })
}

// 页面初始化
onMounted(() => {
  // 模拟初始加载
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

/* 页面头部 */
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

/* 搜索卡片 */
.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 列表卡片 */
.list-card {
  border-radius: 8px;
}

/* 分页 */
.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 详情弹窗样式 */
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

/* 上传组件 */
.upload-component {
  margin-top: 5px;
}
</style>