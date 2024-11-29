<template>
  <div class="login-container">
    <el-form
        :rules="formRules"
        ref="loginForm"
        label-width="80px"
        @submit.native.prevent="handleLogin"
    >
      <el-form-item label="用户名">
        <el-input v-model="loginForm.username" @update:model-value="val => loginForm.username = val" autocomplete="off" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" type="password" autocomplete="off"  placeholder="请输入密码"/>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="loginForm.telephone" autocomplete="off" placeholder="请输入手机号"/>
      </el-form-item>

      <!-- 图形验证码 -->
      <el-form-item label="人机验证">
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
      <el-form-item label="短信验证">
        <el-row>
          <el-col :span="12">
            <el-input v-model="loginForm.code" autocomplete="off" placeholder="请输入短信验证码" />
          </el-col>
          <el-col :span="12">
            <el-button @click="getSmsCode" type="text" :disabled="isCodeSent">发送验证码</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button
            type="primary"
            @click="handleLogin"
        >
          系统登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, reactive} from 'vue';
import axios from '@/api/axiosConfig';
import { ElMessage } from 'element-plus';

// 定义表单数据结构
interface LoginForm {
  username: string;
  password: string;
  telephone: string;
  captcha: string;
  code: string;
}

const loginForm = ref({
  username: '',
  password: '',
  telephone: '',
  captcha: '',
  code: ''
});

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  telephone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
};

const captchaUrl = ref<string>(''); // 图形验证码的 URL
const isCodeSent = ref<boolean>(false); // 判断短信验证码是否已发送

// 页面加载时获取图形验证码
const getCaptcha = async () => {
  try {
    const response = await axios.post('/captcha', {}, { responseType: 'arraybuffer' });

    // 创建 Blob 对象并生成一个 URL
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    captchaUrl.value = URL.createObjectURL(blob); // 将 Blob 转换为 URL
    console.log(loginForm);
  } catch (error) {
    ElMessage.error('获取图形验证码失败');
  }
};

// 获取短信验证码
const getSmsCode = async () => {
  if (!loginForm.value.telephone || !loginForm.value.captcha) {
    ElMessage.error('请输入手机号和图形验证码');
    return;
  }

  try {
    const response = await axios.post('/code', {
      telephone: loginForm.value.telephone,
      captcha: loginForm.value.captcha
    });
    ElMessage.success(response.data.detail);
    isCodeSent.value = true; // 短信验证码已发送
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '图形验证码错误');
  }
};

// 处理登录
const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.telephone || !loginForm.value.code) {
    ElMessage.error('请填写所有字段');
    return;
  }

  const formData = new FormData();
  formData.append('username', loginForm.value.username);
  formData.append('password', loginForm.value.password || ''); // 密码可以为空
  formData.append('telephone', loginForm.value.telephone);
  formData.append('code', loginForm.value.code);

  try {
    const response = await axios.post('/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // 登录成功，保存 token 到 localStorage
    const token = response.data.access_token;
    localStorage.setItem('access_token', token);
    ElMessage.success('登录成功');
    // 登录成功后跳转到主页
    this.$router.push('/dashboard');
  } catch (error) {
    ElMessage.error('登录失败，用户名或密码错误');
  }
};

onMounted(() => {
  getCaptcha();
});
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

img {
  width: 100%;
  margin-top: 10px;
  cursor: pointer;
}
</style>
