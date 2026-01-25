<template>
  <div class="student-container">
    <div class="page-header">
      <h3>学生管理</h3>
      <div class="header-actions">
        <el-button type="primary" @click="openStudentForm">新增学生</el-button>
        <el-button @click="handleImport">批量导入</el-button>
        <el-button @click="handleExport">导出列表</el-button>
      </div>
    </div>

    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentNo" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-select v-model="searchForm.deptId" placeholder="选择院系" clearable>
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学科分类">
          <el-select v-model="searchForm.subjectType" placeholder="选择学科" clearable>
            <el-option label="文科" value="LIBERAL" />
            <el-option label="理科" value="SCIENCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="searchForm.grade" placeholder="选择年级" clearable>
            <el-option label="大一" value="FRESHMAN" />
            <el-option label="大二" value="SOPHOMORE" />
            <el-option label="大三" value="JUNIOR" />
            <el-option label="大四" value="SENIOR" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否毕业">
          <el-select v-model="searchForm.isGraduate" placeholder="选择状态" clearable>
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchStudentList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table
          :data="studentList"
          border
          stripe
          :loading="tableLoading"
          :empty-text="emptyText"
      >
        <el-table-column label="No" type="index" width="60" align="center" />
        <el-table-column label="学号" prop="studentNo" align="center" />
        <el-table-column label="学生姓名" prop="studentName" align="center" />
        <el-table-column label="性别" prop="gender" align="center" width="80">
          <template #default="scope">
            {{ scope.row.gender === '1' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column label="所属院系" prop="deptName" align="center" />
        <el-table-column label="专业班级" prop="className" align="center" />
        <el-table-column label="学科分类" prop="subjectType" align="center" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.subjectType === 'LIBERAL' ? 'info' : 'success'">
              {{ scope.row.subjectType === 'LIBERAL' ? '文科' : '理科' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="年级" prop="grade" align="center" width="100">
          <template #default="scope">
            {{ getGradeText(scope.row.grade) }}
          </template>
        </el-table-column>
        <el-table-column label="是否毕业" prop="isGraduate" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isGraduate === '1' ? 'danger' : 'success'">
              {{ scope.row.isGraduate === '1' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" prop="phone" align="center" />
        <el-table-column label="参与活动数" prop="activityCount" align="center" />
        <el-table-column label="累计志愿时长" prop="volunteerHours" align="center">
          <template #default="scope">
            {{ scope.row.volunteerHours }}小时
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="scope">
            <el-button type="text" @click="openStudentForm(scope.row)">编辑</el-button>
            <el-button type="text" @click="viewStudentActivity(scope.row.id)">查看活动</el-button>
            <el-button type="text" @click="deleteStudent(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar" v-if="pageInfo.total > 0">
        <span class="total-text">Total {{ pageInfo.total }}</span>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageInfo.currentPage"
            :page-size="pageInfo.pageSize"
            :total="pageInfo.total"
            layout="prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        :title="isEdit ? '编辑学生信息' : '新增学生'"
        v-model="isFormOpen"
        width="600px"
    >
      <el-form :model="studentForm" :rules="studentRules" ref="studentFormRef" label-width="120px">
        <el-form-item label="学号" prop="studentNo" :disabled="isEdit">
          <el-input v-model="studentForm.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="学生姓名" prop="studentName">
          <el-input v-model="studentForm.studentName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="studentForm.gender">
            <el-radio label="1">男</el-radio>
            <el-radio label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属院系" prop="deptId">
          <el-select v-model="studentForm.deptId" placeholder="选择院系">
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专业班级" prop="className">
          <el-input v-model="studentForm.className" placeholder="请输入专业班级" />
        </el-form-item>
        <el-form-item label="学科分类" prop="subjectType">
          <el-select v-model="studentForm.subjectType" placeholder="选择学科分类">
            <el-option label="文科" value="LIBERAL" />
            <el-option label="理科" value="SCIENCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="studentForm.grade" placeholder="选择年级" @change="handleGradeChange">
            <el-option label="大一" value="FRESHMAN" />
            <el-option label="大二" value="SOPHOMORE" />
            <el-option label="大三" value="JUNIOR" />
            <el-option label="大四" value="SENIOR" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否毕业" prop="isGraduate">
          <el-select
              v-model="studentForm.isGraduate"
              placeholder="选择是否毕业"
              :disabled="studentForm.grade !== 'SENIOR'"
          >
            <el-option label="否" value="0" />
            <el-option label="是" value="1" />
          </el-select>
          <div class="form-tip" v-if="studentForm.grade !== 'SENIOR'">
            仅大四学生可设置毕业状态
          </div>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isFormOpen = false">取消</el-button>
        <el-button type="primary" @click="submitStudentForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog title="批量导入学生" v-model="isImportOpen" width="500px">
      <el-upload
          class="upload-dragger"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          accept=".xlsx,.xls"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">拖拽文件至此处上传<br/>或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">
          <el-link type="primary" @click="downloadTemplate">下载导入模板</el-link>
          <p>仅支持.xlsx/.xls格式，单次最多导入500条</p>
          <p>模板字段说明：学号,姓名,性别(1=男/2=女),院系ID,专业班级,学科分类(LIBERAL=文科/SCIENCE=理科),年级(FRESHMAN=大一等),是否毕业(仅大四支持1=是，其他年级填0),手机号</p>
        </div>
      </el-upload>
      <template #footer>
        <el-button @click="isImportOpen = false">取消</el-button>
        <el-button type="primary" @click="submitImport">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();

// 年级映射（value转中文）
const gradeMap = ref({
  FRESHMAN: '大一',
  SOPHOMORE: '大二',
  JUNIOR: '大三',
  SENIOR: '大四'
});

// 模拟接口（新增字段适配）
const getStudentList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: [
            {
              id: '1',
              studentNo: '2023001',
              studentName: '李四',
              gender: '1',
              deptName: '计算机学院',
              className: '软件工程2班',
              subjectType: 'SCIENCE', // 理科
              grade: 'FRESHMAN', // 大一
              isGraduate: '0', // 未毕业
              phone: '13800138003',
              activityCount: 3,
              volunteerHours: 10
            },
            {
              id: '2',
              studentNo: '2022001',
              studentName: '王五',
              gender: '2',
              deptName: '文学院',
              className: '汉语言文学1班',
              subjectType: 'LIBERAL', // 文科
              grade: 'SENIOR', // 大四
              isGraduate: '1', // 已毕业
              phone: '13900139000',
              activityCount: 5,
              volunteerHours: 20
            }
          ],
          total: 2
        }
      });
    }, 500);
  });
};
const getDeptList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: [
          { id: '1', deptName: '计算机学院' },
          { id: '2', deptName: '文学院' }
        ]
      });
    }, 300);
  });
};
const addStudent = (data) => Promise.resolve({ code: 200 });
const editStudent = (data) => Promise.resolve({ code: 200 });
const deleteStudentApi = (id) => Promise.resolve({ code: 200 });
const importStudent = (formData) => Promise.resolve({ code: 200 });

// 变量定义（新增3个字段）
const tableLoading = ref(false);
const studentList = ref([]);
const emptyText = ref('暂无学生数据');
const searchForm = reactive({
  studentNo: '',
  studentName: '',
  deptId: '',
  subjectType: '', // 学科分类搜索
  grade: '', // 年级搜索
  isGraduate: '' // 是否毕业搜索
});
const pageInfo = reactive({ currentPage: 1, pageSize: 10, total: 0 });
const deptList = ref([]);
const isFormOpen = ref(false);
const isEdit = ref(false);
const isImportOpen = ref(false);
const studentFormRef = ref(null);
const studentForm = reactive({
  id: '',
  studentNo: '',
  studentName: '',
  gender: '1',
  deptId: '',
  className: '',
  subjectType: '', // 学科分类（LIBERAL/SCIENCE）
  grade: '', // 年级（FRESHMAN/SOPHOMORE/JUNIOR/SENIOR）
  isGraduate: '0', // 是否毕业（0=否/1=是）
  phone: ''
});
// 导入相关
const fileList = ref([]);
const importFile = ref(null);

// 表单规则（动态校验：仅大四必填是否毕业）
const studentRules = reactive({
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  deptId: [{ required: true, message: '请选择院系', trigger: 'change' }],
  className: [{ required: true, message: '请输入专业班级', trigger: 'blur' }],
  subjectType: [{ required: true, message: '请选择学科分类', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  isGraduate: [
    {
      required: () => studentForm.grade === 'SENIOR',
      message: '请选择是否毕业',
      trigger: 'change'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ]
});

// 核心方法
const getGradeText = (grade) => {
  return gradeMap.value[grade] || grade;
};

// 年级变更时自动重置毕业状态
const handleGradeChange = () => {
  if (studentForm.grade !== 'SENIOR') {
    studentForm.isGraduate = '0';
  }
};

const fetchStudentList = async () => {
  try {
    tableLoading.value = true;
    const res = await getStudentList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      ...searchForm
    });
    if (res.code === 200) {
      studentList.value = res.data.list;
      pageInfo.total = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取学生列表失败');
    }
  } catch (error) {
    ElMessage.error('获取学生列表异常');
  } finally {
    tableLoading.value = false;
  }
};

const fetchDeptList = async () => {
  try {
    const res = await getDeptList();
    if (res.code === 200) {
      deptList.value = res.data;
    }
  } catch (error) {
    ElMessage.error('获取院系列表失败');
  }
};

const resetSearch = () => {
  Object.assign(searchForm, {
    studentNo: '',
    studentName: '',
    deptId: '',
    subjectType: '',
    grade: '',
    isGraduate: ''
  });
  pageInfo.currentPage = 1;
  fetchStudentList();
};

const handleSizeChange = (size) => {
  pageInfo.pageSize = size;
  fetchStudentList();
};

const handleCurrentChange = (page) => {
  pageInfo.currentPage = page;
  fetchStudentList();
};

const openStudentForm = (row = null) => {
  if (row) {
    isEdit.value = true;
    Object.assign(studentForm, {
      id: row.id,
      studentNo: row.studentNo,
      studentName: row.studentName,
      gender: row.gender,
      deptId: row.deptId || '',
      className: row.className,
      subjectType: row.subjectType || '',
      grade: row.grade || '',
      // 关键：非大四强制设为未毕业
      isGraduate: row.grade === 'SENIOR' ? (row.isGraduate || '0') : '0',
      phone: row.phone
    });
  } else {
    isEdit.value = false;
    studentFormRef.value?.resetFields();
    Object.assign(studentForm, {
      id: '',
      studentNo: '',
      studentName: '',
      gender: '1',
      deptId: '',
      className: '',
      subjectType: '',
      grade: '',
      isGraduate: '0',
      phone: ''
    });
  }
  isFormOpen.value = true;
};

const submitStudentForm = async () => {
  try {
    await studentFormRef.value.validate();
    const res = isEdit.value ? await editStudent(studentForm) : await addStudent(studentForm);
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '学生信息编辑成功' : '学生新增成功');
      isFormOpen.value = false;
      fetchStudentList();
    } else {
      ElMessage.error(res.msg || (isEdit.value ? '学生信息编辑失败' : '学生新增失败'));
    }
  } catch (error) {
    ElMessage.error('表单校验失败，请检查输入');
    console.error(error);
  }
};

// 查看学生参与的活动
const viewStudentActivity = (id) => {
  router.push(`/admin/activity/manage/list?studentId=${id}`);
};

// 删除学生
const deleteStudent = async (id) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除该学生信息吗？删除后将无法恢复',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'danger'
        }
    );

    const res = await deleteStudentApi(id);
    if (res.code === 200) {
      ElMessage.success('学生信息删除成功');
      fetchStudentList();
    } else {
      ElMessage.error(res.msg || '学生信息删除失败');
    }
  } catch (error) {
    if (error.message !== 'cancel') {
      ElMessage.error('学生信息删除异常');
    }
  }
};

// 批量导入相关方法
const handleImport = () => {
  isImportOpen.value = true;
  fileList.value = [];
  importFile.value = null;
};

const handleFileChange = (file) => {
  fileList.value = [file];
  importFile.value = file.raw;
};

const downloadTemplate = () => {
  // 模拟模板下载（包含新增字段）
  const blob = new Blob([
    '学号,姓名,性别(1=男/2=女),院系ID,专业班级,学科分类(LIBERAL=文科/SCIENCE=理科),年级(FRESHMAN=大一/SOPHOMORE=大二/JUNIOR=大三/SENIOR=大四),是否毕业(仅大四支持1=是，其他年级填0),手机号\n',
    '2023001,张三,1,1,软件工程1班,SCIENCE,FRESHMAN,0,13800138000\n',
    '2022001,王五,2,2,汉语言文学1班,LIBERAL,SENIOR,1,13900139000'
  ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '学生信息导入模板.xlsx';
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('导入模板下载成功');
};

const submitImport = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择要导入的Excel文件');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', importFile.value);

    const res = await importStudent(formData);
    if (res.code === 200) {
      ElMessage.success('学生信息批量导入成功');
      isImportOpen.value = false;
      fetchStudentList();
    } else {
      ElMessage.error(res.msg || '学生信息批量导入失败');
    }
  } catch (error) {
    ElMessage.error('学生信息批量导入异常');
    console.error(error);
  }
};

// 导出列表
const handleExport = () => {
  ElMessage.success('学生列表导出成功');
};

// 初始化
onMounted(() => {
  fetchStudentList();
  fetchDeptList();
});
</script>

<style scoped>
/* 基础布局 */
.student-container {
  background-color: #fff;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 搜索栏 */
.search-bar {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

/* 表格容器 */
.table-container {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

/* 分页样式 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f5f7fa;
}

.total-text {
  color: #666;
  font-size: 14px;
}

/* 导入弹窗样式 */
.upload-dragger {
  width: 100%;
  height: 200px;
  line-height: 200px;
  text-align: center;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  margin-bottom: 20px;
  cursor: pointer;
}

.upload-dragger:hover {
  border-color: #409eff;
}

/* 标签样式优化 */
:deep(.el-tag) {
  padding: 4px 8px;
  font-size: 12px;
}

/* 表单提示样式 */
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}
</style>