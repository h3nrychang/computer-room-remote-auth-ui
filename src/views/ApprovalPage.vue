<template>
  <el-container style="height: 100vh;">
    <!-- Header -->
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <el-button type="primary" :icon="CirclePlus" @click="openCreateDialog">新建进入机房审批工单</el-button>
    </el-header>

    <h3 style="padding-bottom: 10px">我申请的工单</h3>

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
            <el-tag type="info" v-if="!item.pro_status && !item.isExpired">未处理</el-tag>
            <el-tag type="success" v-else-if="item.app_status && !item.isExpired">已通过</el-tag>
            <el-tag type="danger" v-else-if="!item.app_status && !item.isExpired">被拒绝</el-tag>
            <el-tag type="warning" v-if="item.isExpired">已失效</el-tag> <!-- 添加失效状态 -->
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
                :disabled="item.isExpired"
                size="small"
                type="primary"
                @click="goToRoomEntry(item.id)"
            >
              规范维护
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <el-pagination
        v-if="totalPages > 1"
        style="margin-top: 20px;"
        background
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        @current-change="fetchApprovalList"
    />

    <!-- 新建审批工单弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建审批工单" :width="dialogWidth" :close-on-click-modal="false">
      <iframe src="/approve" style="width: 100%; height: 400px; border: none;"></iframe>
      <template #footer>
        <el-button @click="createDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 详细信息 -->
    <el-dialog v-model="detailDialogVisible" title="工单详情" :width="dialogWidth" :close-on-click-modal="false">
      <el-descriptions border :column="1">
        <el-descriptions-item label="工单ID">{{ selectedDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="申请进入机房">{{ selectedDetail.room_name }}</el-descriptions-item>
        <el-descriptions-item label="系统显示名称">{{ selectedDetail.sys_name }}</el-descriptions-item>
        <el-descriptions-item label="机房长与ID">{{ selectedDetail.manager_name }}-{{ selectedDetail.manager_id }}</el-descriptions-item>
        <el-descriptions-item label="机房长手机号">{{ selectedDetail.manager_telephone }}</el-descriptions-item>
        <el-descriptions-item label="申请人与ID">{{ selectedDetail.user_name }}-{{ selectedDetail.user_id }}</el-descriptions-item>
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
        <el-descriptions-item label="开门方式" v-if="!selectedDetail.sys_status">{{ selectedDetail.sys_notes }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ selectedDetail.notes || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosInstance from '@/api/axiosConfig';
import { CirclePlus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

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
  isExpired?: boolean;  // 添加过期状态
}

interface ApprovalListResponse {
  approves: ApprovalDetail[];
  total_pages: number;
}

const createDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogWidth = ref('60%');
const approvalList = ref<ApprovalDetail[]>([]);
const totalPages = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const selectedDetail = ref<ApprovalDetail>({});
const router = useRouter();

// 给加一个响应布局，给寸土寸金手机屏幕节约一点空间
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
    const response = await axiosInstance.get<ApprovalListResponse>('/approve/me', {
      params: { page },
    });
    const data = response.data;
    approvalList.value = data.approves.map(item => {
      const currentTime = new Date();
      const createTime = new Date(item.create_time);

      // 检查当前日期和工单创建日期是否相同
      const isSameDay = currentTime.toDateString() === createTime.toDateString();

      // 如果是同一天的工单，isExpired 为 false；否则为 true
      item.isExpired = !isSameDay;

      return item;
    });
    totalPages.value = data.total_pages;
    totalItems.value = data.approves.length * data.total_pages;
    currentPage.value = page;
  } catch (error) {
    console.error('获取审批工单失败:', error);
  }
};

// 工单详情
const viewDetail = (row: ApprovalDetail) => {
  selectedDetail.value = row;
  updateDialogWidth();
  detailDialogVisible.value = true;
};

// 去开门了
const goToRoomEntry = (approveId: number) => {
  router.push({ path: `/roomentry/${approveId}` });
};

// 初始化数据
onMounted(() => {
  fetchApprovalList();
});
</script>

<style>
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

@media (max-width: 768px) {
  .card {
    width: 100%;
  }
}
</style>
