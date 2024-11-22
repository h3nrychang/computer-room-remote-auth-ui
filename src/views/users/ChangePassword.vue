<template>
<!--  <el-button type="primary" @click="openChangePasswordDialog">修改密码</el-button>-->
  <el-form :model="formData" ref="form" label-width="100px" :rules="formRules">
    <el-form-item label="新密码" prop="password">
      <el-input v-model="formData.password" placeholder="请输入新密码" type="password"></el-input>
    </el-form-item>

<!--    <template #footer>-->
<!--      <el-button @click="changePasswordDialogVisible = false">取消</el-button>-->
<!--      <el-button type="primary" @click="submitForm">确认修改</el-button>-->
<!--    </template>-->
  </el-form>
<!--  <el-dialog v-model="changePasswordDialogVisible" title="修改密码" :width="dialogWidth">-->
<!--    <el-form :model="formData" ref="form" label-width="100px" :rules="formRules">-->
<!--      <el-form-item label="新密码" prop="password">-->
<!--        <el-input v-model="formData.password" placeholder="请输入新密码" type="password"></el-input>-->
<!--      </el-form-item>-->

<!--      <template #footer>-->
<!--        <el-button @click="changePasswordDialogVisible = false">取消</el-button>-->
<!--        <el-button type="primary" @click="submitForm">确认修改</el-button>-->
<!--      </template>-->
<!--    </el-form>-->
<!--  </el-dialog>-->
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// Dialog 控制
const changePasswordDialogVisible = ref(false);
const dialogWidth = '400px';

// 表单数据和规则
const formData = ref({
  password: '',
});

const formRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' },
  ],
};

// 获取表单的引用
const form = ref<any>(null);

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  changePasswordDialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (form.value) {
    // 校验表单
    form.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          // 请求 API 修改密码
          const response = await axios.post('/users/change/password', formData.value, {
            headers: {
              'Content-Type': 'application/json', // 设置请求体为 raw 格式
            },
          });

          // 成功提示
          ElMessage.success(response.data.detail || '密码修改成功');
          changePasswordDialogVisible.value = false; // 关闭对话框
          formData.value.password = ''; // 清空表单数据

        } catch (error) {
          if (error.response && error.response.data) {
            ElMessage.error(error.response.data.detail || '密码修改失败，请重试');
          } else {
            ElMessage.error('密码修改失败，请重试');
          }
        }
      } else {
        ElMessage.error('表单验证失败，请检查输入');
      }
    });
  }
};
</script>

<style scoped>
/* 可根据需要调整 Dialog 和按钮样式 */
</style>
