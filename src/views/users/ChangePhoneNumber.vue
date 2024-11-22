<template>
<!--  <el-button type="primary" @click="openChangePhoneDialog">修改手机号</el-button>-->
  <el-form :model="formData" ref="form" label-width="100px" :rules="formRules">
    <el-form-item label="新手机号" prop="telephone">
      <el-input v-model="formData.telephone" placeholder="请输入新手机号" type="tel"></el-input>
    </el-form-item>

<!--    <template #footer>-->
<!--      <el-button @click="changePhoneDialogVisible = false">取消</el-button>-->
<!--      <el-button type="primary" @click="submitForm">确认修改</el-button>-->
<!--    </template>-->
  </el-form>
<!--  <el-dialog v-model="changePhoneDialogVisible" title="修改手机号" :width="dialogWidth">-->
<!--    <el-form :model="formData" ref="form" label-width="100px" :rules="formRules">-->
<!--      <el-form-item label="新手机号" prop="telephone">-->
<!--        <el-input v-model="formData.telephone" placeholder="请输入新手机号" type="tel"></el-input>-->
<!--      </el-form-item>-->

<!--      <template #footer>-->
<!--        <el-button @click="changePhoneDialogVisible = false">取消</el-button>-->
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
const changePhoneDialogVisible = ref(false);
const dialogWidth = '400px';

// 表单数据和规则
const formData = ref({
  telephone: '',
});

const formRules = {
  telephone: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    { pattern: /^[1][3-9][0-9]{9}$/, message: '请输入有效的手机号', trigger: 'blur' },
  ],
};

// 获取表单的引用
const form = ref<any>(null);

// 打开修改手机号对话框
const openChangePhoneDialog = () => {
  changePhoneDialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (form.value) {
    // 校验表单
    form.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          // 请求 API 修改手机号
          const response = await axios.post('/users/change', formData.value, {
            headers: {
              'Content-Type': 'application/json', // 设置请求体为 raw 格式
            },
          });

          // 成功提示
          ElMessage.success(response.data.detail || '手机号修改成功');
          changePhoneDialogVisible.value = false; // 关闭对话框
          formData.value.telephone = ''; // 清空表单数据

        } catch (error) {
          if (error.response && error.response.data) {
            ElMessage.error(error.response.data.detail || '手机号修改失败，请重试');
          } else {
            ElMessage.error('手机号修改失败，请重试');
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
