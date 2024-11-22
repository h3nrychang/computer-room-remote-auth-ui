<template>
  <div>
    <h1>工单号: {{ approveId }}</h1>

    <!-- 步骤条 -->
    <el-steps :active="activeStep" finish-status="success">
      <el-step title="进入机房前拍照"/>
      <el-step title="发起开门请求"/>
      <el-step title="出机房拍照"/>
      <el-step title="发起关门请求"/>
    </el-steps>

    <!-- 步骤内容 -->
    <div v-if="activeStep === 0">
      <h2>进入机房前拍照111</h2>

      <el-upload
          :auto-upload="true"
          :http-request="customUpload"
          :before-upload="beforeUpload"
          :data="{ approve_id: approveId }"
          :show-file-list="true"
          accept="image/*"
          list-type="picture-card"
      >
<!--        <el-button size="small" type="primary">上传照片</el-button>-->
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <div v-if="activeStep === 1">
      <h2>发起开门请求</h2>
      <el-button type="primary" @click="openDoor">发送开门请求</el-button>
      <p v-if="openDoorStatus">{{ openDoorStatus }}</p>
    </div>

    <div v-if="activeStep === 2">
      <h2>出机房拍照</h2>
      <el-upload
          action="/open/photograph/out"
          :auto-upload="false"
          :data="{ approve_id: approveId }"
          :show-file-list="false"
      >
        <el-button size="small" type="primary">上传照片</el-button>
      </el-upload>
    </div>

    <div v-if="activeStep === 3">
      <h2>发起关门请求</h2>
      <el-button type="primary" @click="closeDoor">发送关门请求</el-button>
      <p v-if="closeDoorStatus">{{ closeDoorStatus }}</p>
    </div>

    <!-- 控制步骤 -->
    <el-button @click="nextStep" type="primary" :disabled="activeStep >= 3">下一步</el-button>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import axiosInstance from '@/api/axiosConfig';
import {ElMessage} from 'element-plus';
import {useRoute} from "vue-router";
import axios from "axios";

// 获取工单号
const route = useRoute();
const approveId = route.params.approve_id as string;
const activeStep = ref(0); // 当前步骤
const openDoorStatus = ref<string>(''); // 开门请求状态
const closeDoorStatus = ref<string>(''); // 关门请求状态

// 上传文件回调（通过 FormData）
const customUpload = (data: { file: Blob; approve_id: string }) => {
  console.log("自定义上传", data);

  // 确保 data 中包含文件和 approve_id
  const { file, approve_id } = data;


  if (!file) {
    console.error('缺少文件');
    return;
  }

  if (!approve_id) {
    console.error('缺少工单号');
    return;
  }

  // 封装FormData对象
  const formData = new FormData();
  formData.append("file", file);  // 添加文件
  formData.append("approve_id", approveId);  // 添加工单号

  console.log("formData", formData);
  console.log("approve_id的值是：", approveId);

  // 调用后端接口
  axiosInstance
      .post('/open/photograph/in', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // 确保正确设置 Content-Type
        }
      })
      .then((response) => {
        // 上传成功的响应
        console.log("上传成功", response.data);
        ElMessage.success(response.data.detail);
      })
      .catch((error) => {
        // 上传失败的响应
        console.error("上传失败:", error);
        ElMessage.error(error.response?.data?.detail || '上传失败，请重试');
      });
};

// 在文件上传前做校验
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片');
  }
  return isImage;
};

// 发起开门请求
const openDoor = async () => {
  try {
    const response = await axiosInstance.post('/open', {approve_id: approveId});
    openDoorStatus.value = response.data.detail;
    if (response.data.detail.includes('成功')) {
      activeStep.value = 2; // 开门请求成功后跳到出机房拍照
    }
  } catch (error) {
    ElMessage.error('开门请求失败，请重试');
  }
};

// 发起关门请求
const closeDoor = async () => {
  try {
    const response = await axiosInstance.post('/close', {approve_id: approveId});
    closeDoorStatus.value = response.data.detail;
  } catch (error) {
    ElMessage.error('关门请求失败，请重试');
  }
};

// 控制步骤跳转
const nextStep = () => {
  if (activeStep.value < 3) {
    activeStep.value += 1;
  }
};
</script>

<style scoped>
h2 {
  margin-bottom: 20px;
}
</style>
