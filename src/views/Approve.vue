<template>
  <div class="maintenance-container">
    <el-space direction="vertical">
      <h2><el-text class="mx-0">机房进入申请<br></el-text></h2>
    </el-space>

    <el-form @submit.prevent="submitApplication">
      <!-- 自动补全输入框 -->
      <el-form-item label="选择机房">
        <el-autocomplete v-model="selectedRoomName" :fetch-suggestions="querySearchAsync" placeholder="请输入机房名"
          @select="handleSelect" style="width: 100%" />
      </el-form-item>

      <!-- 输入备注 -->
      <el-form-item label="进入事由">
        <el-input v-model="notes" style="width: 100%" :rows="3" type="textarea" placeholder="安全检查、紧急维护..." />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitApplication" style="width: 100%">
          提交维护申请
        </el-button>
      </el-form-item>

      <!-- 审批按钮，角色ID为1或2时显示 -->
<!--      <el-form-item v-if="roleId == 1">-->
<!--        <el-button type="warning" @click="approveApplication" style="width: 100%">-->
<!--          审批他人申请-->
<!--        </el-button>-->
<!--      </el-form-item>-->
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axiosConfig'
import { useRouter } from 'vue-router'

const selectedRoomName = ref('')
const selectedRoomId = ref<number | null>(null) // 保存选择机房的ID
const notes = ref('') // 备注内容
const roleId = ref<number | null>(null) // 用户角色ID
const router = useRouter()

// 获取用户角色
const fetchUserRole = async () => {
  try {
    const response = await axios.get('/users/me/role')
    roleId.value = response.data.id
  } catch (error) {
    console.error("获取用户角色失败:", error)
  }
}

// 搜索机房的函数
const querySearchAsync = async (queryString: string, cb: (results: any[]) => void) => {
  if (!queryString.trim()) {
    cb([]) // 查询字符串为空时，关闭搜索框
    return
  }
  try {
    const response = await axios.get('/room/get', { params: { name: queryString } })
    const results = response.data.map((room: any) => ({
      value: room.name,
      address: room.address,
      id: room.id
    }))
    cb(results.length > 0 ? results : []) // 没有结果时传递空数组关闭搜索框
  } catch (error) {
    console.error("获取机房数据失败:", error)
    cb([]) // 出现错误时也关闭搜索框
  }
}


// 选择机房时的处理函数
const handleSelect = (item: Record<string, any>) => {
  selectedRoomName.value = item.value
  selectedRoomId.value = item.id // 保存选中机房的ID
}

// 提交维护申请的函数
const submitApplication = async () => {
  if (!selectedRoomId.value) {
    console.warn("请先选择机房")
    return
  }

  try {
    const response = await axios.post('/approve/open', {
      room_id: selectedRoomId.value,
      notes: notes.value
    })
    console.log(response.data.detail) // 处理成功响应
    // 提交成功后的提示
    alert('请求提交成功，请等待系统审批')
    // 清空表单
    selectedRoomName.value = ''
    selectedRoomId.value = null
    notes.value = ''
  } catch (error) {
    console.error("请求提交失败:", error)
    alert('请求提交失败，错误信息：' + error + "您可以将错误信息截图给开发者查看。")
  }
}

// 查看他人申请的函数
const approveApplication = () => {
  router.push('/approvelist') // 跳转到审批列表界面
}

onMounted(() => {
  fetchUserRole() // 获取用户角色
})
</script>

<style scoped>
.maintenance-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 500px;
  margin: auto;
}

.el-autocomplete {
  width: 100%;
}
</style>
