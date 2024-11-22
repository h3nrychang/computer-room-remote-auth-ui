<template>
  <el-container style="height: 100vh;">
    <!-- Header -->
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>需要进入机房？</h2>
      <el-button type="primary" :icon="CirclePlus" @click="openCreateDialog">新建进入机房审批工单</el-button>
    </el-header>

    <!-- Main -->
    <el-main>
      <h3>当前正在审批中的工单</h3>
      <el-table :data="approvalList" style="width: 100%">
        <el-table-column prop="room_name" label="机房" />
        <el-table-column prop="create_time" label="申请时间" />
        <!-- <el-table-column prop="user_name" label="申请人姓名" /> -->
        <el-table-column label="审批状态">
          <template #default="scope">
            <el-tag type="info" v-if="!scope.row.pro_status">未处理</el-tag>
            <el-tag type="success" v-else-if="scope.row.app_status">已通过</el-tag>
            <el-tag type="danger" v-else>被拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开门状态">
          <template #default="scope">
            <el-tag type="info" v-if="!scope.row.pro_status">待审核</el-tag>
            <el-tag type="success" v-else-if="scope.row.open_status">已开门</el-tag>
            <el-tag type="danger" v-else>未开门</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120">
          <template #default="scope">
            <!-- <el-button size="mini" type="text" @click="viewDetail(scope.row)">
              查看详情
            </el-button>
            <el-button size="mini" type="text" @click="viewDetail(scope.row)">
              规范运维
            </el-button> -->
            <el-button-group class="ml-4">
<!--              <el-popover placement="top-start" title="工单详情" :width="200" trigger="hover"-->
<!--                content="点击查看申请人、机房长、手机号等相关信息">-->
<!--                <template #reference>-->
                  <el-button type="primary" :icon="Tickets" @click="viewDetail(scope.row)" />
<!--                </template>-->
<!--              </el-popover>-->
<!--              <el-popover placement="top-start" title="机房规范维护" :width="200" trigger="hover" content="上传开门关门照片，规范机房进出环节">-->
<!--                <template #reference>-->
                  <el-button type="primary" :icon="VideoCamera" @click="goToRoomEntry(scope.row.id)" />
<!--                </template>-->
<!--              </el-popover>-->

            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="totalPages > 1" style="margin-top: 20px;" background layout="prev, pager, next"
        :current-page="currentPage" :page-size="pageSize" :total="totalItems" @current-change="fetchApprovalList" />
    </el-main>

    <!-- Create Dialog -->
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
        <!-- <el-descriptions-item label="机房长ID"></el-descriptions-item> -->
        <el-descriptions-item label="机房长与ID">{{ selectedDetail.manager_name }}-{{ selectedDetail.manager_id
          }}</el-descriptions-item>
        <el-descriptions-item label="机房长手机号">{{ selectedDetail.manager_telephone }}</el-descriptions-item>
        <!-- <el-descriptions-item label="申请人ID">{{ selectedDetail.user_id }}</el-descriptions-item> -->
        <el-descriptions-item label="申请人与ID">{{ selectedDetail.user_name }}-{{ selectedDetail.user_id
          }}</el-descriptions-item>
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
        <el-descriptions-item label="开门方式" v-if="!selectedDetail.sys_status">{{ selectedDetail.sys_notes
          }}</el-descriptions-item>
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
import { CirclePlus, Tickets, VideoCamera } from '@element-plus/icons-vue'
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
    approvalList.value = data.approves;
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
  // const approve_id = ${approveId}
  // router.push({ path: '/roomentry', query: { approve_id: approveId.toString() } });
  // localStorage.setItem('approveId', )
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
</style>
