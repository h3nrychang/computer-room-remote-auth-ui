<template>
    <div class="approve-list-container">
      <el-space direction="vertical" class="header">
        <el-text class="mx-0" size="large">全部工单</el-text>
      </el-space>
<!--  -->
<!--      <el-table v-loading="loading" :data="approves" style="width: 100%">-->
<!--        <el-table-column label="ID" prop="id" width="40" />-->
<!--        <el-table-column label="机房名称" prop="room_name" />-->
<!--        <el-table-column label="申请人" prop="user_name" />-->
<!--        <el-table-column label="联系电话" prop="user_telephone" />-->
<!--        <el-table-column label="备注" prop="notes" />-->
<!--        <el-table-column label="审批结果" :formatter="formatStatus" />-->
<!--      </el-table>-->

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
              <el-popover placement="top-start" title="工单详情" :width="200" trigger="hover"
                          content="点击查看申请人、机房长、手机号等相关信息">
                <template #reference>
                  <el-button :icon="Tickets" @click="viewDetail(scope.row)" />
                </template>
              </el-popover>
              <el-popover placement="top-start" title="机房规范维护" :width="200" trigger="hover" content="上传开门关门照片，规范机房进出环节">
                <template #reference>
                  <el-button :icon="VideoCamera" @click="roomAccess()" />
                </template>
              </el-popover>

            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

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
  import {Tickets, VideoCamera} from "@element-plus/icons-vue";
  
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

  // import { ref, onMounted } from 'vue';
  import axiosInstance from '@/api/axiosConfig';
  // import { CirclePlus, Tickets, VideoCamera } from '@element-plus/icons-vue'


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
  // const totalPages = ref(0);
  // const currentPage = ref(1);
  const pageSize = ref(10);
  // const totalItems = ref(0);
  const selectedDetail = ref<ApprovalDetail>({});

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

  // 初始化数据
  onMounted(() => {
    fetchApprovalList();
  });


  // 初次加载历史审批工单列表
  // onMounted(() => {
  //   getApproveList(currentPage.value)
  // })
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
  