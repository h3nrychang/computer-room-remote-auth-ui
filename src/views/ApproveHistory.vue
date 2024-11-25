<template>
    <div class="approve-list-container">
      <el-space direction="vertical" class="header">
        <el-text class="mx-0" size="large">全部工单</el-text>
      </el-space>
      <!-- 卡片列表 -->
      <div class="card-list">
        <el-card
            v-for="(item, index) in approvalList"
            :key="index"
            shadow="always"
            class="card"
        >
          <div class="card-content">
            <div class="card-header">
              <span class="card-title">{{ item.room_name }}</span>
              <el-tag type="info" v-if="!item.pro_status">未处理</el-tag>
              <el-tag type="success" v-else-if="item.app_status">已通过</el-tag>
              <el-tag type="danger" v-else>被拒绝</el-tag>
            </div>
            <div class="card-body">
              <p>申请时间：{{ item.create_time }}</p>
              <p>
                开门状态：
                <el-tag type="success" v-if="item.open_status">已开门</el-tag>
                <el-tag type="danger" v-else>未开门</el-tag>
              </p>
            </div>
            <div class="card-actions">
              <el-button
                  size="small"
                  type="primary"
                  @click="viewDetail(item)"
              >
                详情
              </el-button>
              <el-button
                  size="small"
                  type="primary"
                  :disabled="!item.pro_status"
                  @click="fetchPhotos(item.id)"
              >
                查看照片
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <el-dialog v-model="detailDialogVisible" title="工单详情" :width="dialogWidth" :close-on-click-modal="false">
        <el-descriptions border :column="1">
          <el-descriptions-item label="工单ID">{{ selectedDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="申请进入机房">{{ selectedDetail.room_name }}</el-descriptions-item>
          <el-descriptions-item label="系统显示名称">{{ selectedDetail.sys_name }}</el-descriptions-item>
          <!-- <el-descriptions-item label="机房长ID"></el-descriptions-item> -->
          <el-descriptions-item label="机房长与ID">{{ selectedDetail.manager_name }}-{{
              selectedDetail.manager_id
            }}
          </el-descriptions-item>
          <el-descriptions-item label="机房长手机号">{{ selectedDetail.manager_telephone }}</el-descriptions-item>
          <!-- <el-descriptions-item label="申请人ID">{{ selectedDetail.user_id }}</el-descriptions-item> -->
          <el-descriptions-item label="申请人与ID">{{ selectedDetail.user_name }}-{{
              selectedDetail.user_id
            }}
          </el-descriptions-item>
          <el-descriptions-item label="申请人手机号">{{ selectedDetail.user_telephone }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag type="info" v-if="!selectedDetail.pro_status">未审批</el-tag>
            <el-tag type="success" v-else-if="selectedDetail.app_status">审批通过</el-tag>
            <el-tag type="danger" v-else>审批拒绝</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审批工单创建时间">{{ selectedDetail.create_time }}</el-descriptions-item>
          <el-descriptions-item label="远程开门">
            <el-tag type="success" v-if="selectedDetail.sys_status">支持</el-tag>
            <el-tag type="danger" v-else>不支持</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开门方式" v-if="!selectedDetail.sys_status">{{
              selectedDetail.sys_notes
            }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ selectedDetail.notes || '无' }}</el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="photoDialogVisible" title="工单照片" :width="dialogWidth" :close-on-click-modal="false">
        <div v-if="photos.length">
          <div class="photo-gallery">
            <el-row gutter="20">
              <el-col :span="6" v-for="(photo, index) in photos" :key="index">
                <el-image
                    :src="photo.path"
                    :alt="`照片类型: ${photo.type}`"
                    :preview-src-list="photos.map(p => p.path)"
                    fit="contain"
                >
                  <div class="image-caption">{{ photo.type }}</div>
                </el-image>
              </el-col>
            </el-row>
          </div>
        </div>
        <div v-else>
          <p style="text-align: center; color: gray;">暂无照片</p>
        </div>

        <template #footer>
          <el-button @click="photoDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>


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
  import axiosInstance from '@/api/axiosConfig';

  // 声明数据
  const approves = ref<any[]>([])  // 审批工单列表
  const totalPages = ref(1)  // 总页数
  const totalItems = ref(0)  // 总条数
  const currentPage = ref(1)  // 当前页数
  const loading = ref(true);
  
  // 获取历史审批工单列表
  const getApproveList = async (page: number) => {
    try {
      loading.value = true;
      const response = await axios.get('/approve/list', {
        params: {
          pro_status: true, // 只显示已处理的工单
          page: page
        }
      })
      approves.value = response.data.approves
      totalPages.value = response.data.total_pages
      totalItems.value = response.data.approves.length
    } catch (error) {
      ElMessage.error('获取历史审批工单失败')
    } finally {
      loading.value = false;
    }
  }
  
  // 格式化状态
  const formatStatus = (row: any) => {
    return row.app_status ? '审批通过' : '被拒绝'
  }
  
  // 处理分页切换
  const handlePageChange = (page: number) => {
    currentPage.value = page
    getApproveList(page)
  }

  interface ApprovalDetail {
    id?: number;
    user_id?: number;
    manager_id?: number;
    room_name?: string;
    user_name?: string;
    sys_name?: string;
    manager_name?: string;
    user_telephone?: string;
    manager_telephone?: string;
    pro_status?: boolean;
    app_status?: boolean;
    sys_status?: boolean;
    notes?: string;
    sys_notes?: string;
    create_time?: string;
  }

  interface ApprovalListResponse {
    approves: ApprovalDetail[];
    total_pages: number;
  }

  const createDialogVisible = ref(false);
  const detailDialogVisible = ref(false);
  const photoDialogVisible = ref(false);
  const dialogWidth = ref('60%');
  const approvalList = ref<ApprovalDetail[]>([]);
  // const totalPages = ref(0);
  // const currentPage = ref(1);
  const pageSize = ref(10);
  // const totalItems = ref(0);
  const selectedDetail = ref<ApprovalDetail>({});
  const photos = ref<Photo[]>([]); // 用于存储获取到的照片数据

  // 给加一个响应布局，给节约一点寸土寸金手机屏幕
  const updateDialogWidth = () => {
    const screenWidth = window.innerWidth;
    dialogWidth.value = screenWidth <= 768 ? '90%' : '60%';
  };

  // 打开创建审批工单弹窗
  const openCreateDialog = () => {
    updateDialogWidth();
    createDialogVisible.value = true;
  };

  // 对接一下后端，获取审批列表API
  const fetchApprovalList = async (page = 1) => {
    try {
      const response = await axiosInstance.get<ApprovalListResponse>('/approve/list', {
        params: { page },
      });
      const data = response.data;
      approvalList.value = data.approves;
      totalPages.value = data.total_pages;
      totalItems.value = data.approves.length * data.total_pages;
      currentPage.value = page;
    } catch (error) {
      console.error('获取审批工单失败:', error);
    }
  };

  // 查看工单详情
  const viewDetail = (row: ApprovalDetail) => {
    selectedDetail.value = row;
    updateDialogWidth();
    detailDialogVisible.value = true;
  };

  interface Photo {
    path: string;
    type: string;
  }

  const API_BASE_URL = 'http://113.45.195.128:8081/';

  const fetchPhotos = async (approveId: number) => {
    try {
      const response = await axiosInstance.get('/approve/photograph', {
        params: { approve_id: approveId },
      });
      photos.value = response.data.photos.map((photo: any) => ({
        ...photo,
        path: `${API_BASE_URL}${photo.path}`,
      }));
      photoDialogVisible.value = true;
    } catch (error) {
      ElMessage.error('获取照片失败，你可以将错误信息截图给开发者：' + error);
      console.error('获取照片失败:', error);
    }
  };


  // 初始化数据
  onMounted(() => {
    fetchApprovalList();
  });

  </script>
  
  <style scoped>
  .approve-list-container {
    padding: 0;
  }
  
  .header {
    margin-bottom: 20px;
  }
  
  .el-table {
    margin-bottom: 20px;
  }

  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
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

  .card-body {
    font-size: 14px;
    color: #666;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .el-image {
    border-radius: 8px;
  }


  @media (max-width: 768px) {
    .card {
      width: 100%;
    }
  }
  </style>
  