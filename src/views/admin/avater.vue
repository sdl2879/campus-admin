<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request' // 改用你的request.js

const avatarUrl = ref('')

// 初始化加载头像
const loadAvatar = async () => {
  const res = await request.get('/user/admin/info')
  avatarUrl.value = res.data.avatar || ''
}

// 头像上传成功回调
const handleAvatarSuccess = (res) => {
  if (res.code === 200) {
    avatarUrl.value = res.data
    ElMessage.success('头像上传成功')
  }
}

// 上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('请上传图片格式文件！')
  if (!isLt2M) ElMessage.error('头像大小不能超过2MB！')
  return isImage && isLt2M
}

loadAvatar()
</script>