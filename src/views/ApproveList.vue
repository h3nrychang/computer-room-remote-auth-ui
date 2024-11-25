<template>
  <div class="approve-list-container" v-loading="loading">
    <el-space direction="vertical" class="header">
      <el-text class="mx-0" size="large">待审核工单列表</el-text>
    </el-space>

    <!-- 卡片列表 -->
    <div class="card-list">
      <el-card v-for="(row, index) in approves" :key="index" class="card">
        <div class="card-content">
          <div class="card-header">
<!--            <span class="card-title">工单 ID: {{ row.id }}</span>-->
            <span class="card-title">{{ row.room_name }}</span>
            <span class="card-status">{{ formatStatus(row) }}</span>
          </div>
          <div class="card-body">
<!--            <p>机房名称: {{ row.room_name }}</p>-->
            <p>申请人: {{ row.user_name }}</p>
            <p>联系电话: {{ row.user_telephone }}</p>
            <p>事由: {{ row.notes || '申请人未填写' }}</p>
          </div>
          <div class="card-actions">
            <el-button
                v-if="!row.app_status"
                @click="approveWorkOrder(row.id)"
                type="success"
                size="small"
            >
              通过
            </el-button>
            <el-button
                v-if="!row.app_status"
                @click="rejectWorkOrder(row.id)"
                type="danger"
                size="small"
            >
              拒绝
            </el-button>
            <span v-else>已处理</span>
          </div>
        </div>
      </el-card>
    </div>

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
const loading = ref(true)

// 获取待审核工单列表
const getApproveList = async (page: number) => {
  try {
    loading.value = true
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
    loading.value = false
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
      approve_status: true // 审批通过
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
      approve_status: false // 审批不通过
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

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 自动调整列数，最小宽度为300px */
  gap: 20px;
}

.card {
  border-radius: 8px;
  overflow: hidden;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
}

.card-status {
  font-size: 14px;
  color: #666;
}

.card-body {
  font-size: 14px;
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .card {
    width: 100%;
  }
}
</style>
