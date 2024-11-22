<template>
  <div class="room-list-container">
    <!-- 添加机房按钮 -->
    <!-- <el-button type="primary" @click="drawer = true">添加机房</el-button>
    <el-button type="danger" @click="delDrawer = true">删除机房</el-button> -->

    <el-header class="header">

      <div>
        <el-button type="primary" @click="drawer = true">添加机房</el-button>
        <el-button type="danger" @click="delDrawer = true">删除机房</el-button>
      </div>

      <el-input v-model="input" style="width: 240px" :prefix-icon="Search" placeholder="搜索机房"/>
    </el-header>


    <!-- 机房列表 -->
    <el-table v-loading="loading" :data="rooms" style="width: 100%; height: 100%;">
      <el-table-column type="expand">
        <template #default="props">
          <!-- <div v-if="props.row.details">
            <p>地址: {{ props.row.details.address }}</p>
            <p>机房长ID: {{ props.row.details.manager_id }}</p>
            <p>机房长: {{ props.row.details.manager_name }}</p>
            <p>电话: {{ props.row.details.manager_telephone }}</p>
            <p>机房类型: {{ props.row.details.room_type }}</p>
            <p>状态: {{ props.row.details.status }}</p>
            <p>系统名称: {{ props.row.details.sys_name }}</p>
          </div> -->

          <h3>详细信息</h3>
    <el-table :data="[props.row.details]" >
      <!-- <el-table-column label="地址" prop="address" /> -->
      <el-table-column label="机房长ID" prop="manager_id" />
      <el-table-column label="机房长" prop="manager_name" />
      <el-table-column label="电话" prop="manager_telephone" />
      <el-table-column label="机房类型" prop="room_type" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="系统名称" prop="sys_name" />
    </el-table>

        </template>
      </el-table-column>
      <el-table-column label="ID" prop="id" width="auto"></el-table-column>
      <el-table-column label="机房名称" prop="name"></el-table-column>
      <el-table-column label="机房地址" prop="address"></el-table-column>
      <el-table-column label="机房长" prop="manager_name"></el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalRooms"
      @current-change="handlePageChange"
      layout="prev, pager, next, jumper"
    ></el-pagination>

    <!-- 添加机房抽屉 -->
    <el-drawer v-model="drawer" title="添加机房" :visible.sync="drawerVisible" direction="rtl" size="30%">
      <el-form ref="addRoomForm" :model="roomData" label-width="80px">
        <el-form-item label="机房名称">
          <el-input v-model="roomData.name" placeholder="请输入机房名称"></el-input>
        </el-form-item>
        <el-form-item label="机房地址">
          <el-input v-model="roomData.address" placeholder="请输入机房地址"></el-input>
        </el-form-item>
        <el-form-item label="管理员ID">
          <el-input v-model="roomData.manager_id" placeholder="请输入管理员ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitRoom">提交</el-button>
          <el-button @click="drawer = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 删除机房抽屉 -->
    <el-drawer v-model="delDrawer" title="删除机房" :visible.sync="drawerVisible" direction="rtl" size="30%">
      <el-form ref="delRoomForm" :model="roomData" label-width="80px">
        <el-form-item label="机房名称">
          <el-input v-model="roomData.name" placeholder="请输入机房名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitDelRoom">提交</el-button>
          <el-button @click="delDrawer = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axiosConfig'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'


const currentPage = ref(1);
const pageSize = ref(10);
const totalRooms = ref(0);
const rooms = ref([]);
const loading = ref(true);

const drawer = ref(false)
const delDrawer = ref(false)

const roomData = ref({
  id: '',
  name: '',
  address: '',
  manager_id: ''
});

// 提交添加机房的表单
const submitRoom = async () => {
  try {
    await axios.post('/room/create', roomData.value);
    ElMessage.success('机房添加成功');
    drawer.value = false;
    fetchRoomList(currentPage.value); // 刷新机房列表
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '添加机房失败');
  }
};

// 提交删除机房的表单
const submitDelRoom = async () => {
  try {
    await axios.delete('/room/delete', roomData.value);
    ElMessage.success('机房删除成功');
    delDrawer.value = false;
    fetchRoomList(currentPage.value); // 刷新机房列表
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '删除机房失败');
  }
};

// 获取机房列表并附带详细信息
const fetchRoomList = async (page) => {
  try {
    loading.value = true;
    const response = await axios.get('/room/list', { params: { page } });
    rooms.value = response.data.rooms.map(room => ({
      ...room,
      details: {
        address: room.address,
        manager_id: room.manager_id,
        manager_name: room.manager_name,
        manager_telephone: room.manager_telephone,
        room_type: room.room_type,
        status: room.status,
        sys_name: room.sys_name,
        detailsArray: [
      { label: '地址', value: room.address },
      { label: '机房长ID', value: room.manager_id },
      { label: '机房长', value: room.manager_name },
      { label: '电话', value: room.manager_telephone },
      { label: '机房类型', value: room.room_type },
      { label: '状态', value: room.status },
      { label: '系统名称', value: room.sys_name }
    ]
      }
    }));
    totalRooms.value = response.data.total_pages * pageSize.value;
  } catch (error) {
    ElMessage.error('加载机房列表失败');
  } finally {
    loading.value = false;
  }
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchRoomList(page);
};

onMounted(() => {
  fetchRoomList(currentPage.value);
});
</script>

<style scoped lang="scss">
.header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}


.room-list-container {
  padding: 20px;
}

// .el-button {
//   margin-bottom: 20px;
// }
</style>
