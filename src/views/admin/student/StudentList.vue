<template>
  <div class="student-list">
    <div class="page-header">
      <h2>学生管理</h2>
      <div class="operate-group">
        <el-button type="primary" @click="openAddDialog">新增学生</el-button>
        <el-button link @click="handleExport">导出列表</el-button>
      </div>
    </div>

    <el-card shadow="hover" class="search-card">
      <el-form :model="searchForm" label-width="100px" inline>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentNo" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-select v-model="searchForm.deptId" placeholder="请选择院系" clearable>
            <el-option label="计算机学院" value="1" />
            <el-option label="电子信息学院" value="2" />
            <el-option label="文学院" value="3" />
            <el-option label="外国语学院" value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="1" />
            <el-option label="冻结" value="0" />
          </el-select>
        </el-form-item>
        <!-- 毕业状态筛选 -->
        <el-form-item label="毕业状态">
          <el-select v-model="searchForm.graduationStatus" placeholder="请选择" clearable>
            <el-option label="未毕业" :value="0" />
            <el-option label="已毕业" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="学号" prop="studentNo" width="150" />
        <el-table-column label="姓名" prop="name" width="120" />
        <el-table-column label="所属院系" prop="deptName" width="180" />
        <el-table-column label="所属专业" prop="majorName" width="180" />
        <el-table-column label="入学年份" prop="grade" width="120" />
        <!-- 毕业状态列 -->
        <el-table-column label="毕业状态" width="120">
          <template #default="scope">
            <el-tag type="info" v-if="isGraduated(scope.row.grade)">已毕业</el-tag>
            <el-tag type="success" v-else>未毕业</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" prop="phone" width="150" />
        <el-table-column label="账号状态" width="120">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === 1">正常</el-tag>
            <el-tag type="danger" v-else>冻结</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="200" />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button link @click="openDetailDialog(scope.row.id)">查看详情</el-button>
            <el-button link @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button
                link
                :type="scope.row.status === 1 ? 'danger' : 'success'"
                @click="handleStatusChange(scope.row.id, scope.row.status === 1 ? 0 : 1)"
            >
              {{ scope.row.status === 1 ? '冻结' : '解冻' }}
            </el-button>
            <el-button link type="warning" @click="handleResetPwd(scope.row.id)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
      />
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addDialogVisible" title="新增学生" width="600px" destroy-on-close>
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="addForm.studentNo" placeholder="请输入学号（6-20字符）" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入真实姓名（2-50字符）" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="addForm.deptId" placeholder="请选择所属院系" @change="handleDeptChange">
            <el-option label="计算机学院" :value="1" />
            <el-option label="电子信息学院" :value="2" />
            <el-option label="文学院" :value="3" />
            <el-option label="外国语学院" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="majorId">
          <el-select v-model="addForm.majorId" placeholder="请选择所属专业" :disabled="!addForm.deptId">
            <template v-if="addForm.deptId === 1">
              <el-option label="计算机科学与技术" :value="101" />
              <el-option label="软件工程" :value="102" />
              <el-option label="人工智能" :value="103" />
              <el-option label="数据科学与大数据技术" :value="104" />
              <el-option label="网络工程" :value="105" />
            </template>
            <template v-else-if="addForm.deptId === 2">
              <el-option label="通信工程" :value="201" />
              <el-option label="电子信息工程" :value="202" />
              <el-option label="微电子科学与工程" :value="203" />
              <el-option label="光电信息科学与工程" :value="204" />
              <el-option label="集成电路设计与集成系统" :value="205" />
            </template>
            <template v-else-if="addForm.deptId === 3">
              <el-option label="汉语言文学" :value="301" />
              <el-option label="历史学" :value="302" />
              <el-option label="哲学" :value="303" />
              <el-option label="新闻传播学" :value="304" />
              <el-option label="戏剧影视文学" :value="305" />
            </template>
            <template v-else-if="addForm.deptId === 10">
              <el-option label="英语" :value="1001" />
              <el-option label="日语" :value="1002" />
              <el-option label="法语" :value="1003" />
              <el-option label="德语" :value="1004" />
              <el-option label="西班牙语" :value="1005" />
              <el-option label="俄语" :value="1006" />
            </template>
            <el-option v-else label="请先选择院系" disabled />
          </el-select>
        </el-form-item>
        <!-- 入学年份 -->
        <el-form-item label="入学年份" prop="grade">
          <el-select v-model="addForm.grade" placeholder="请选择入学年份">
            <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入初始密码（6-20字符）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确认新增</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="学生详情" width="600px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学号">{{ detailForm.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">{{ getDeptName(detailForm.deptId) }}</el-descriptions-item>
        <el-descriptions-item label="所属专业">{{ getMajorName(detailForm.majorId) }}</el-descriptions-item>
        <el-descriptions-item label="入学年份">{{ detailForm.grade }}</el-descriptions-item>
        <el-descriptions-item label="毕业状态">
          <el-tag type="info" v-if="isGraduated(detailForm.grade)">已毕业</el-tag>
          <el-tag type="success" v-else>未毕业</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detailForm.phone }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag type="success" v-if="detailForm.status === 1">正常</el-tag>
          <el-tag type="danger" v-else>冻结</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailForm.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑学生" width="600px" destroy-on-close>
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
        <el-form-item label="学号">
          <el-input v-model="editForm.studentNo" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="editForm.deptId" placeholder="请选择院系" @change="handleEditDeptChange">
            <el-option label="计算机学院" :value="1" />
            <el-option label="电子信息学院" :value="2" />
            <el-option label="文学院" :value="3" />
            <el-option label="外国语学院" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="majorId">
          <el-select v-model="editForm.majorId" placeholder="请选择专业" :disabled="!editForm.deptId">
            <template v-if="editForm.deptId === 1">
              <el-option label="计算机科学与技术" :value="101" />
              <el-option label="软件工程" :value="102" />
              <el-option label="人工智能" :value="103" />
              <el-option label="数据科学与大数据技术" :value="104" />
              <el-option label="网络工程" :value="105" />
            </template>
            <template v-else-if="editForm.deptId === 2">
              <el-option label="通信工程" :value="201" />
              <el-option label="电子信息工程" :value="202" />
              <el-option label="微电子科学与工程" :value="203" />
              <el-option label="光电信息科学与工程" :value="204" />
              <el-option label="集成电路设计与集成系统" :value="205" />
            </template>
            <template v-else-if="editForm.deptId === 3">
              <el-option label="汉语言文学" :value="301" />
              <el-option label="历史学" :value="302" />
              <el-option label="哲学" :value="303" />
              <el-option label="新闻传播学" :value="304" />
              <el-option label="戏剧影视文学" :value="305" />
            </template>
            <template v-else-if="editForm.deptId === 10">
              <el-option label="英语" :value="1001" />
              <el-option label="日语" :value="1002" />
              <el-option label="法语" :value="1003" />
              <el-option label="德语" :value="1004" />
              <el-option label="西班牙语" :value="1005" />
              <el-option label="俄语" :value="1006" />
            </template>
            <el-option v-else label="请先选择院系" disabled />
          </el-select>
        </el-form-item>
        <!-- 入学年份 -->
        <el-form-item label="入学年份" prop="grade">
          <el-select v-model="editForm.grade" placeholder="请选择入学年份">
            <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditConfirm">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getStudentPage,
  addStudent,
  updateStudentStatus,
  resetStudentPwd,
  exportStudentList,
  getStudentById,
  updateStudent
} from '@/api/admin/student'
import { exportExcel } from '@/utils/export'

// ===== 基础分页数据 =====
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ===== 搜索表单 =====
const searchForm = reactive({
  studentNo: '',
  name: '',
  deptId: '',
  status: '',
  graduationStatus: '' // 0: 未毕业, 1: 已毕业
})

// ===== 年份配置（字符串格式）=====
const CURRENT_YEAR = 2026
const STUDENT_DURATION = 4
const gradeOptions = Array.from({ length: 7 }, (_, i) => `${CURRENT_YEAR - 6 + i}级`) // ["2020级", ..., "2026级"]

// 从 "2023级" 提取年份数字
const extractYearFromGrade = (gradeStr) => {
  if (!gradeStr || typeof gradeStr !== 'string') return null
  const match = gradeStr.match(/^(\d{4})级$/)
  return match ? parseInt(match[1], 10) : null
}

// 判断是否毕业（当前时间 2026 年，4 年制 → 2022 级及以前 = 毕业生）
const isGraduated = (gradeStr) => {
  const year = extractYearFromGrade(gradeStr)
  return year !== null && year <= CURRENT_YEAR - STUDENT_DURATION // ≤2022
}

// ===== 新增相关 =====
const addDialogVisible = ref(false)
const addFormRef = ref(null)
const addForm = reactive({
  studentNo: '',
  name: '',
  deptId: null,
  majorId: null,
  phone: '',
  password: '',
  grade: ''
})
const addRules = reactive({
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 6, max: 20, message: '学号长度为6-20字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50字符', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择所属院系', trigger: 'change' }],
  majorId: [{ required: true, message: '请选择所属专业', trigger: 'change' }],
  grade: [{ required: true, message: '请选择入学年份', trigger: 'change' }],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20字符', trigger: 'blur' }
  ]
})

// ===== 详情相关 =====
const detailDialogVisible = ref(false)
const detailForm = reactive({})

// ===== 编辑相关 =====
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: null,
  studentNo: '',
  name: '',
  deptId: null,
  majorId: null,
  phone: '',
  grade: ''
})
const editRules = reactive({
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50字符', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择所属院系', trigger: 'change' }],
  majorId: [{ required: true, message: '请选择所属专业', trigger: 'change' }],
  grade: [{ required: true, message: '请选择入学年份', trigger: 'change' }]
})

// ===== 院系/专业映射 =====
const deptMap = { 1: '计算机学院', 2: '电子信息学院', 3: '文学院', 10: '外国语学院' }
const majorMap = {
  101: '计算机科学与技术', 102: '软件工程', 103: '人工智能', 104: '数据科学与大数据技术', 105: '网络工程',
  201: '通信工程', 202: '电子信息工程', 203: '微电子科学与工程', 204: '光电信息科学与工程', 205: '集成电路设计与集成系统',
  301: '汉语言文学', 302: '历史学', 303: '哲学', 304: '新闻传播学', 305: '戏剧影视文学',
  1001: '英语', 1002: '日语', 1003: '法语', 1004: '德语', 1005: '西班牙语', 1006: '俄语'
}
const getDeptName = (id) => deptMap[id] || '未知院系'
const getMajorName = (id) => majorMap[id] || '未知专业'

// ===== 获取列表 =====
const fetchStudentList = async () => {
  try {
    const query = {
      studentNo: searchForm.studentNo || undefined,
      name: searchForm.name || undefined,
      deptId: searchForm.deptId || undefined,
      status: searchForm.status || undefined,
      graduationStatus: searchForm.graduationStatus === '' ? undefined : Number(searchForm.graduationStatus),
      pageNum: Number(pageNum.value),
      pageSize: Number(pageSize.value)
    }
    const res = await getStudentPage(query)
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    ElMessage.error('查询失败：' + (error.message || '系统异常'))
  }
}

onMounted(() => {
  fetchStudentList()
})

// ===== 弹窗控制 =====
const openAddDialog = () => {
  addDialogVisible.value = true
}
const handleDeptChange = () => {
  addForm.majorId = null
}
const handleAdd = async () => {
  try {
    await addFormRef.value.validate()
    const submitData = {
      ...addForm,
      deptId: Number(addForm.deptId),
      majorId: Number(addForm.majorId)
    }
    const res = await addStudent(submitData)
    if (res?.code === 200) {
      ElMessage.success(res.msg)
      addDialogVisible.value = false
      fetchStudentList()
      addFormRef.value.resetFields()
    } else {
      ElMessage.error(res?.msg || '新增失败')
    }
  } catch (error) {
    ElMessage.error('新增失败：' + (error.message || '系统异常'))
  }
}

const openDetailDialog = async (id) => {
  try {
    const res = await getStudentById(id)
    const data = res.data || res
    Object.assign(detailForm, data)
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载详情失败')
  }
}

const openEditDialog = (row) => {
  Object.assign(editForm, {
    id: row.id,
    studentNo: row.studentNo,
    name: row.name,
    deptId: row.deptId,
    majorId: row.majorId,
    phone: row.phone,
    grade: row.grade
  })
  editDialogVisible.value = true
}
const handleEditDeptChange = () => {
  editForm.majorId = null
}
const handleEditConfirm = async () => {
  try {
    await editFormRef.value.validate()
    const submitData = {
      id: editForm.id,
      name: editForm.name,
      deptId: Number(editForm.deptId),
      majorId: Number(editForm.majorId),
      phone: editForm.phone,
      grade: editForm.grade
    }
    const res = await updateStudent(submitData)
    if (res?.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      fetchStudentList()
    } else {
      ElMessage.error(res?.msg || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败：' + error.message)
  }
}

// ===== 搜索 & 分页 =====
const handleSearch = () => {
  pageNum.value = 1
  fetchStudentList()
}
const resetSearch = () => {
  Object.assign(searchForm, {
    studentNo: '',
    name: '',
    deptId: '',
    status: '',
    graduationStatus: ''
  })
  handleSearch()
}
const handleSizeChange = (val) => {
  pageSize.value = Number(val)
  fetchStudentList()
}
const handleCurrentChange = (val) => {
  pageNum.value = Number(val)
  fetchStudentList()
}

// ===== 状态操作 =====
const handleStatusChange = async (id, status) => {
  const action = status === 1 ? '冻结' : '解冻'
  ElMessageBox.confirm(`确定要${action}该学生账号吗？`, '提示').then(async () => {
    const res = await updateStudentStatus(id, status)
    if (res?.code === 200) {
      ElMessage.success(res.msg)
      fetchStudentList()
    } else {
      ElMessage.error(res?.msg || '操作失败')
    }
  }).catch(() => {})
}

const handleResetPwd = async (id) => {
  ElMessageBox.confirm('重置后密码为123456，是否继续？', '提示').then(async () => {
    const res = await resetStudentPwd(id)
    if (res?.code === 200) {
      ElMessage.success(res.msg)
    } else {
      ElMessage.error(res?.msg || '重置失败')
    }
  }).catch(() => {})
}

// ===== 导出 =====
const handleExport = async () => {
  try {
    const query = {
      studentNo: searchForm.studentNo || undefined,
      name: searchForm.name || undefined,
      deptId: searchForm.deptId || undefined,
      status: searchForm.status || undefined,
      graduationStatus: searchForm.graduationStatus === '' ? undefined : Number(searchForm.graduationStatus)
    }
    const res = await exportStudentList(query)
    exportExcel(res, '学生列表', [
      { label: '学号', prop: 'studentNo' },
      { label: '姓名', prop: 'name' },
      { label: '所属院系', prop: 'deptName' },
      { label: '所属专业', prop: 'majorName' },
      { label: '入学年份', prop: 'grade' },
      { label: '毕业状态', prop: 'grade', formatter: v => isGraduated(v) ? '已毕业' : '未毕业' },
      { label: '联系方式', prop: 'phone' },
      { label: '账号状态', prop: 'status', formatter: v => v === 1 ? '正常' : '冻结' },
      { label: '创建时间', prop: 'createTime' }
    ])
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + (error.message || '系统异常'))
  }
}
</script>

<style scoped>
.student-list { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.operate-group { display: flex; gap: 10px; }
.search-card { margin-bottom: 20px; }
.table-card { min-height: 500px; }
.pagination { margin-top: 20px; text-align: right; }
</style>