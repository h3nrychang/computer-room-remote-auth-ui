<template>
    <div class="manager-list-container">
      <el-space direction="vertical" class="header">
        <el-text class="mx-0" size="large">机房管理人员列表</el-text>
      </el-space>
<!--      <el-text class="mx-1" type="danger">注：此表格有bug，需要修改。</el-text>-->


  
      <!-- 管理人员列表 -->
      <el-table :data="managers" style="width: 100%"

      >
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="姓名" prop="manager_name" />
        <el-table-column label="联系电话" prop="manager_telephone" />
        <el-table-column label="地址" prop="manager_address" />
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
  const managers = ref<any[]>([])  // 管理人员列表
  const totalPages = ref(1)  // 总页数
  const totalItems = ref(0)  // 总条数
  const currentPage = ref(1)  // 当前页数
  
  // 获取机房管理人员列表
  const getManagerList = async (page: number) => {
    try {
      const response = await axios.get('/manager/list', { params: { page: page } })
      managers.value = response.data.managers
      totalPages.value = response.data.total_pages
      totalItems.value = response.data.managers.length
    } catch (error) {
      ElMessage.error('获取机房管理人员失败')
    }
  }
  
  // 处理分页切换
  const handlePageChange = (page: number) => {
    currentPage.value = page
    getManagerList(page)
  }
  
  // 初次加载管理人员列表
  onMounted(() => {
    getManagerList(currentPage.value)
  })
  </script>
  
  <style scoped>
  .manager-list-container {
    padding: 20px;
  }
  
  .header {
    margin-bottom: 20px;
  }
  
  .el-table {
    margin-bottom: 20px;
  }
  </style>
  