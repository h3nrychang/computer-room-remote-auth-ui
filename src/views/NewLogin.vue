<template>
  <div class="login-container">
    <el-form :model="loginForm" ref="loginForm" label-width="80px" @submit.native.prevent="handleLogin">
      <el-form-item label="用户名">
        <el-input v-model="loginForm.username" autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="loginForm.telephone" autocomplete="off" />
      </el-form-item>

      <!-- 图形验证码 -->
      <el-form-item label="图形验证码">
        <el-row>
          <el-col :span="12">
            <el-input v-model="loginForm.captcha" autocomplete="off" placeholder="请输入验证码" />
          </el-col>
          <el-col :span="12">
            <el-button @click="getCaptcha" type="text" icon="el-icon-refresh" />
          </el-col>
        </el-row>
        <img :src="captchaUrl" :key="captchaUrl" alt="验证码" style="cursor: pointer;" @click="getCaptcha" />
      </el-form-item>

      <!-- 短信验证码 -->
      <el-form-item label="短信验证码">
        <el-row>
          <el-col :span="12">
            <el-input v-model="loginForm.code" autocomplete="off" placeholder="请输入短信验证码" />
          </el-col>
          <el-col :span="12">
            <el-button @click="getSmsCode" type="text" :disabled="isCodeSent">发送验证码</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item>
        <el-button type="warning" @click="handleApprove">维护申请</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">系统登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from '@/api/axiosConfig';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        telephone: '',
        captcha: '', // 图形验证码
        code: '' // 短信验证码
      },
      captchaUrl: '', // 图形验证码的 URL
      isCodeSent: false // 判断短信验证码是否已发送
    };
  },
  methods: {
    // 获取图形验证码
    async getCaptcha() {
      try {
        const response = await axios.post('/captcha', {}, { responseType: 'arraybuffer' });
        const blob = new Blob([response.data], { type: 'image/jpeg' });
        this.captchaUrl = URL.createObjectURL(blob);
      } catch (error) {
        ElMessage.error('获取图形验证码失败');
      }
    },

    // 获取短信验证码
    async getSmsCode() {
      if (!this.loginForm.telephone || !this.loginForm.captcha) {
        ElMessage.error('请输入手机号和图形验证码');
        return;
      }

      try {
        const response = await axios.post('/code', {
          telephone: this.loginForm.telephone,
          captcha: this.loginForm.captcha
        });
        ElMessage.success(response.data.detail);
        this.isCodeSent = true; // 短信验证码已发送
      } catch (error) {
        ElMessage.error(error.response?.data?.detail || '图形验证码错误');
      }
    },

    // 处理维护申请，同时进行登录请求并跳转到 /approve
    async handleApprove() {
      const token = localStorage.getItem('access_token');
      if (token) {
        // 如果 token 存在，直接跳转到 Approve 页面
        this.$router.push('/approve');
      } else {
        try {
          const formData = new FormData();
          formData.append('username', this.loginForm.username);
          formData.append('password', this.loginForm.password);
          formData.append('telephone', this.loginForm.telephone);

          const response = await axios.post('/token', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          // 登录成功，保存 token 到 localStorage
          const token = response.data.access_token;
          localStorage.setItem('access_token', token);
          this.$message.success('登录成功');
          this.$router.push('/approve');
        } catch (error) {
          this.$message.error('登录失败，用户名或密码错误');
        }
      }
    },

    // 处理登录
    async handleLogin() {
      try {
        const formData = new FormData();
        formData.append('username', this.loginForm.username);
        formData.append('password', this.loginForm.password);
        formData.append('telephone', this.loginForm.telephone);
        formData.append('code', this.loginForm.code); // 加入短信验证码

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
  },
  mounted() {
    this.getCaptcha();
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
