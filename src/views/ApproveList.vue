<template>
  <div class="approve-list-container">
    <el-space direction="vertical" class="header">
      <el-text class="mx-0" size="large">待审核工单列表</el-text>
    </el-space>

    <el-table v-loading="loading" :data="approves" style="width: 100%">
      <el-table-column label="ID" prop="id" width="40" />
      <el-table-column label="机房名称" prop="room_name" />
      <el-table-column label="申请人" prop="user_name" />
      <el-table-column label="联系电话" prop="user_telephone" />
      <el-table-column label="备注" prop="notes" />
      <el-table-column label="状态" :formatter="formatStatus" />

      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button v-if="!row.app_status" @click="approveWorkOrder(row.id)" type="success" size="small">通过</el-button>
          <el-button v-if="!row.app_status" @click="rejectWorkOrder(row.id)" type="danger" size="small">拒绝</el-button>
          <span v-else>已处理</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :page-size="10"
      :total="totalItems"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axiosConfig'
import { ElMessage } from 'element-plus'

// 声明数据
const approves = ref<any[]>([])  // 审批工单列表
const totalPages = ref(1)  // 总页数
const totalItems = ref(0)  // 总条数
const currentPage = ref(1)  // 当前页数
const loading = ref(true);

// 获取待审核工单列表
const getApproveList = async (page: number) => {
  try {
    loading.value = true;
    const response = await axios.get('/approve/list', {
      params: {
        pro_status: false, // 显示待审核的工单
        page: page
      }
    })
    approves.value = response.data.approves
    totalPages.value = response.data.total_pages
    totalItems.value = response.data.approves.length
  } catch (error) {
    ElMessage.error('获取待审核工单失败')
  } finally {
    loading.value = false;
  }
}

// 格式化状态
const formatStatus = (row: any) => {
  return !row.app_status ? '待审核' : '已处理'
}

// 审批工单
const approveWorkOrder = async (id: number) => {
  try {
    const response = await axios.post('/approve/approve', {
      approve_id: id,
      approve_status: true  // 审批通过
    })
    ElMessage.success(response.data.detail || '审批通过')
    // 更新工单列表
    getApproveList(currentPage.value)
  } catch (error) {
    ElMessage.error('网络错误，审批失败 错误码: ' + error)
  }
}

// 拒绝工单
const rejectWorkOrder = async (id: number) => {
  try {
    const response = await axios.post('/approve/approve', {
      approve_id: id,
      approve_status: false  // 审批不通过
    })
    ElMessage.success(response.data.detail || '已拒绝该申请')
    // 更新工单列表
    getApproveList(currentPage.value)
  } catch (error) {
    ElMessage.error('网络错误，请求失败 错误码: ' + error)
  }
}

// 处理分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page
  getApproveList(page)
}

// 初次加载待审核工单列表
onMounted(() => {
  getApproveList(currentPage.value)
})
</script>

<style scoped>
.approve-list-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.el-table {
  margin-bottom: 20px;
}
</style>
