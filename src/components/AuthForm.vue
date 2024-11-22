<template>
    <el-form :model="form" ref="authForm" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="form.username" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password"></el-input>
      </el-form-item>
      <el-form-item label="电话">
        <el-input v-model="form.telephone"></el-input>
      </el-form-item>
      <el-button type="primary" @click="onSubmit">{{ isLogin ? '登录' : '注册' }}</el-button>
    </el-form>
  </template>
  
  <script>
  import { login, register } from '../api/auth';
  
  export default {
    props: {
      isLogin: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        form: {
          username: '',
          password: '',
          telephone: '',
        },
      };
    },
    methods: {
      async onSubmit() {
        try {
          const result = this.isLogin
            ? await login(this.form.username, this.form.password, this.form.telephone)
            : await register(this.form.username, this.form.password, this.form.telephone);
          alert(result.detail || '成功');
        } catch (error) {
          alert(error.message);
        }
      },
    },
  };
  </script>
  