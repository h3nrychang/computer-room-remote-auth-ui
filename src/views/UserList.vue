<template>
  <div class="user-list-container">
    

    <el-header class="header">
      <el-button type="primary"  @click="signup()">添加用户</el-button>
      <el-input v-model="input" style="width: 240px" :prefix-icon="Search" placeholder="搜索用户" />
    </el-header>

    <el-table 
    v-loading="loading" 
    element-loading-text="数据正在赶来的路上..." 
    :data="users" 
    style="width: 100%"
    >


      <el-table-column label="用户名" prop="username"></el-table-column>
      <el-table-column label="手机号" prop="telephone"></el-table-column>
      <el-table-column label="角色" prop="role"></el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="120px">
        <template #default="{ row }">
<!--          <el-button @click="editUser(row)" size="mini" type="primary"><el-icon><EditPen /></el-icon>编辑</el-button>-->
          <!-- <el-button @click="resetPassword(row)" size="mini" type="warning">重置密码</el-button> -->
          <el-button @click="deleteUser(row)" size="mini" type="danger"><el-icon><Delete /></el-icon>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="totalUsers"
      @current-change="handlePageChange" layout="prev, pager, next, jumper"></el-pagination>
  </div>

  <!-- 详细信息 -->
  <template>
    <el-dialog v-model="signupDialogVisible" :width="dialogWidth" title="新建用户">
      <el-form ref="signupForm" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="电话" prop="telephone">
          <el-input v-model="formData.telephone" placeholder="请输入电话号码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="signupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">注册</el-button>
      </div>
    </el-dialog>
  </template>


</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from '@/api/axiosConfig';
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from "element-plus";



const currentPage = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);
const users = ref([]);
const loading = ref(true);
const signupDialogVisible = ref(false);
const dialogWidth = ref('60%');


// 表单数据和规则
const formData = ref({
  username: '',
  password: '',
  telephone: '',
});

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  telephone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^[0-9\-+()]*$/, message: '请输入有效的电话号码', trigger: 'blur' },
  ],
};

// 获取表单实例
const signupForm = ref(null);

// 提交注册表单
const submitForm = async () => {
  if (signupForm.value) {
    signupForm.value.validate((valid) => {
      if (valid) {
        axios
            .post('/users/create', formData.value, {
              headers: { 'Content-Type': 'application/json' },
            })
            .then(() => {
              ElMessage.success(`用户 ${formData.value.username} 成功创建`);
              signupDialogVisible.value = false;
              formData.value = { username: '', password: '', telephone: '' };
            })
            .catch((error) => {
              ElMessage.error(error.response?.data?.detail || '注册失败，请重试');
            });
      } else {
        ElMessage.error('请填写完整的注册信息');
      }
    });
  }
};



const updateDialogWidth = () => {
  const screenWidth = window.innerWidth;
  dialogWidth.value = screenWidth <= 768 ? '90%' : '60%';
};

const signup = () => {
  // selectedDetail.value = row;
  updateDialogWidth();
  signupDialogVisible.value = true;
};


// 获取用户列表
const fetchUserList = async (page) => {
  try {
    const response = await axios.get('/users/list', {
      params: {
        page: page || currentPage.value
      }
    });

    users.value = response.data.users;
    totalUsers.value = response.data.total_pages * pageSize.value;

    loading.value = false;
  } catch (error) {
    if (error.response && error.response.data.detail === 'No permission') {
      this.$message.error('您没有权限查看用户列表');
      this.$router.push('/dashboard');
    } else {
      this.$message.error('加载用户列表失败');
    }
    loading.value = false;
  }
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  loading.value = true;
  fetchUserList(page);
};

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList(currentPage.value);
  updateDialogWidth();
  window.addEventListener('resize', updateDialogWidth);
});

// 编辑用户信息
const editUser = (user) => {
  // 你可以根据需要弹出一个编辑表单
  console.log('编辑用户:', user);
  // 此处可以弹出一个 modal 或者跳转到编辑页面
};

// 重置用户密码
const resetPassword = async (user) => {
  try {
    const response = await axios.post('/users/reset/password', {
      username: user.username,
      telephone: user.telephone
    });
    this.$message.success(response.data.detail);
  } catch (error) {
    this.$message.error('密码重置失败');
  }
};

// 删除用户
const deleteUser = async (user) => {
  try {
    const response = await axios.delete('/users/delete', {
      data: {
        username: user.username,
        telephone: user.telephone
      }
    });
    this.$message.success(response.data.detail);
    // 删除成功后刷新用户列表
    fetchUserList(currentPage.value);
  } catch (error) {
    this.$message.error('删除用户失败');
  }
};

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDialogWidth);
});

</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
}


.user-list-container {
  padding: 20px;
}

.el-table {
  margin-bottom: 20px;
}

.el-button {
  margin-right: 10px;
}
</style>
