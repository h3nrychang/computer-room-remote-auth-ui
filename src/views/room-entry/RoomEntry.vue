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
      <h2>请上传清晰的机房开门照片</h2>

      <el-upload
          :auto-upload="true"
          :http-request="customUpload"
          :before-upload="beforeUpload"
          :data="() => ({ approve_id: approveId })"
          :show-file-list="true"
          accept="image/*"
          list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <div v-if="activeStep === 1">
      <h2>发起开门请求</h2>
      <el-button type="primary" @click="openDoor">发送开门请求</el-button>
      <p v-if="openDoorStatus">{{ openDoorStatus }}</p>
    </div>

    <div v-if="activeStep === 2">
      <h2>请上传清晰的机房关门照片</h2>
      <el-upload
          :auto-upload="true"
          :http-request="customUploadout"
          :before-upload="beforeUpload"
          :data="() => ({ approve_id: approveId })"
          :show-file-list="true"
          accept="image/*"
          list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <div v-if="activeStep === 3">
      <h2>发起关门请求</h2>
      <el-button type="primary" @click="closeDoorNew">发送关门请求</el-button>
      <p v-if="closeDoorStatus">{{ closeDoorStatus }}</p>
    </div>

    <!-- 控制步骤 -->
    <el-button
        @click="nextStep"
        type="primary"
        :disabled="!canProceed || activeStep >= 3"
    >
      下一步
    </el-button>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import axiosInstance from '@/api/axiosConfig';
import {ElMessage} from 'element-plus';
import {useRoute} from "vue-router";
import axios from "axios";

// 获取工单号
const route = useRoute();
const approveId = route.params.approve_id as string || '';

if (!approveId) {
  ElMessage.error("工单号缺失，请从正确的页面进入");
}

const activeStep = ref(0); // 当前步骤
const canProceed = ref(false); // 是否可以进入下一步
const openDoorStatus = ref<string>(''); // 开门请求状态
const closeDoorStatus = ref<string>(''); // 关门请求状态

// 上传文件回调
const customUpload = (data: { file: Blob; approve_id: string }) => {

  console.log("自定义上传", data);

  const { file, approve_id } = data;
  const effectiveApproveId = approve_id || approveId; // 优先使用 data 的 approve_id
  if (!effectiveApproveId) {
    console.error("缺少工单号");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("approve_id", effectiveApproveId);
  console.log("上传数据:", formData);

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
        canProceed.value = true;
      })
      .catch((error) => {
        // 上传失败的响应
        console.error("上传失败:", error);
        ElMessage.error(error.response?.data?.detail || '上传失败，请重试');
      });
};

// 上传文件回调
const customUploadout = (data: { file: Blob; approve_id: string }) => {

  console.log("自定义上传", data);

  const { file, approve_id } = data;
  const effectiveApproveId = approve_id || approveId; // 优先使用 data 的 approve_id
  if (!effectiveApproveId) {
    console.error("缺少工单号");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("approve_id", effectiveApproveId);
  console.log("上传数据:", formData);

  console.log("approve_id的值是：", approveId);

  // 调用后端接口
  axiosInstance
      .post('/open/photograph/out', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // 确保正确设置 Content-Type
        }
      })
      .then((response) => {
        // 上传成功的响应
        console.log("上传成功", response.data);
        ElMessage.success(response.data.detail);
        canProceed.value = true;
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
    // 使用 params 参数传递工单号
    const response = await axiosInstance.post('/open', null, {
      params: { approve_id: approveId }, // 将参数添加到查询字符串
    });
    // 处理响应
    openDoorStatus.value = response.data.detail;
    if (response.data.detail.includes('成功')) {
      activeStep.value = 2; // 开门请求成功后跳到出机房拍照
    }
    ElMessage.success(response.data.detail);

  } catch (error) {
    // 处理错误
    ElMessage.error('开门请求错误：'+error+'，您可以截图给开发者查看');
  }
};

// 发起关门请求
const closeDoor = async () => {
  try {
    const response = await axiosInstance.post('/close', {approve_id: approveId});
    closeDoorStatus.value = response.data.detail;
    ElMessage.success(response.data.detail);

  } catch (error) {
    ElMessage.error('关门请求错误：'+error+'，您可以截图给开发者查看');
  }
};

const closeDoorNew = async () => {
  try {
    // 使用 params 参数传递工单号
    const response = await axiosInstance.post('/close', null, {
      params: { approve_id: approveId }, // 将参数添加到查询字符串
    });
    // 处理响应
    closeDoorStatus.value = response.data.detail;
    if (response.data.detail.includes('成功')) {
    }
    ElMessage.success(response.data.detail);
  } catch (error) {
    // 处理错误
    ElMessage.error('关门请求错误：'+error+'，您可以截图给开发者查看');
  }
};

// 控制步骤
const nextStep = () => {
  if (activeStep.value < 3) {
    activeStep.value += 1;
    canProceed.value = false; // 进入下一步后重置为不可继续
  }
};
</script>

<style scoped>
h2 {
  margin-bottom: 20px;
}
</style>
