<template>
  <div class="login-container">
    <!-- <el-form :model="loginForm" ref="loginForm" label-width="80px" @submit.native.prevent="handleLogin">
      <el-form-item label="用户名">
        <el-input v-model="loginForm.username" autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="loginForm.telephone" autocomplete="off" />
      </el-form-item>
      <el-form-item> -->
        <el-button type="warning" @click="handleZiyou">自有人员维护</el-button>
      <!-- </el-form-item>
      <el-form-item> -->
        <el-button type="primary" @click="handleShigong">施工单位登录</el-button>
      <!-- </el-form-item> -->
    <!-- </el-form> -->
  </div>
</template>

<script>
import axios from '@/api/axiosConfig';

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        telephone: ''
      }
    };
  },
  methods: {
    // 处理维护申请，同时进行登录请求并跳转到 /approve
    async handleApprove() {
      const token = localStorage.getItem('access_token');
      if (token) {
        // 如果 token 存在，直接跳转到 Approve 页面
        this.$router.push('/approve');
      } else {
        try {
        // 将表单数据转换为 form-data 格式
        const formData = new FormData();
        formData.append('username', this.loginForm.username);
        formData.append('password', this.loginForm.password);
        formData.append('telephone', this.loginForm.telephone);

        // 发送 POST 请求获取 token
        const response = await axios.post('/token', formData, {
          headers: { 'Content-Type': 'multipart/form-data' } // 确保使用 form-data 格式
        });

        // 登录成功，保存 token 到 localStorage
        const token = response.data.access_token;
        localStorage.setItem('access_token', token);
        this.$message.success('登录成功');
        this.$router.push('/approve'); // 登录成功后跳转到主页
      } catch (error) {
        this.$message.error('登录失败，用户名或密码错误');
      }
      }
    },
    async handleLogin() {
      try {
        // 将表单数据转换为 form-data 格式
        const formData = new FormData();
        formData.append('username', this.loginForm.username);
        formData.append('password', this.loginForm.password);
        formData.append('telephone', this.loginForm.telephone);

        // 发送 POST 请求获取 token
        const response = await axios.post('/token', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // 登录成功，保存 token 到 localStorage
        const token = response.data.access_token;
        localStorage.setItem('access_token', token);
        this.$message.success('登录成功');
        this.$router.push('/dashboard');
      } catch (error) {
        this.$message.error('登录失败，用户名或密码错误');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  width: 300px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
}
</style>
