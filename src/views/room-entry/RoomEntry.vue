<template>
  <div>

    <h1>工单号: {{ approveId }}</h1>

    <!-- 步骤条 -->
    <el-steps :active="activeStep" finish-status="success">
      <el-step title="进入机房前拍照" />
      <el-step v-if="isRemoteOpen" title="远程开门" />
      <el-step title="施工中拍照" />
      <el-step title="施工后拍照" />
      <el-step title="出机房拍照" />
    </el-steps>

    <!-- 步骤内容 -->
    <div v-if="activeStep === 0">
      <h2>请上传清晰的机房进入前照片</h2>
      <el-upload
          :auto-upload="true"
          :http-request="customUpload('in')"
          :before-upload="beforeUpload"
          :data="() => ({ approve_id: approveId })"
          :show-file-list="true"
          accept="image/*"
          list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <div v-if="isRemoteOpen && activeStep === 1">
      <h2>发起远程开门请求</h2>
      <el-button type="primary" @click="openDoor">发送开门请求</el-button>
      <p v-if="openDoorStatus">{{ openDoorStatus }}</p>
    </div>

    <div v-if="isRemoteOpen && activeStep === 2 || !isRemoteOpen && activeStep === 1">
      <h2>请上传施工中的机房照片</h2>
      <el-upload
          :auto-upload="true"
          :http-request="customUpload('work')"
          :before-upload="beforeUpload"
          :data="() => ({ approve_id: approveId })"
          :show-file-list="true"
          accept="image/*"
          list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <div v-if="isRemoteOpen && activeStep === 3 || !isRemoteOpen && activeStep === 2">
      <h2>请上传施工后的机房照片</h2>
      <el-upload
          :auto-upload="true"
          :http-request="customUpload('report')"
          :before-upload="beforeUpload"
          :data="() => ({ approve_id: approveId })"
          :show-file-list="true"
          accept="image/*"
          list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <div v-if="isRemoteOpen && activeStep === 4 || !isRemoteOpen && activeStep === 3">
      <h2>请上传出机房照片</h2>
      <el-upload
          :auto-upload="true"
          :http-request="customUpload('out')"
          :before-upload="beforeUpload"
          :data="() => ({ approve_id: approveId })"
          :show-file-list="true"
          accept="image/*"
          list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <!-- 控制步骤 -->
    <el-button
        @click="nextStep"
        type="primary"
        :disabled="!canProceed || activeStep >= 4"
    >
      下一步
    </el-button>

    <!-- 异常报备按钮 -->
    <el-button
        type="danger"
        :icon="WarnTriangleFilled"
        @click="openReportDialog"
        style="position: fixed; bottom: 80px; right: 20px; z-index: 9999;"
        round
        size="large"
    >
      报备异常
    </el-button>



  </div>

  <!-- 异常报备 Dialog -->
  <el-dialog
      title="报备异常"
      width="400px"
      @close="resetForm"
      v-model="reportDialogVisible"
  >
    <el-form :model="form" ref="formRef" label-width="80px">
      <el-form-item label="异常备注" :rules="[{ required: true, message: '请输入异常备注', trigger: 'blur' }]">
        <el-input v-model="form.notes" type="textarea" placeholder="请输入异常备注"></el-input>
      </el-form-item>
      <el-form-item label="异常类型" :rules="[{ required: true, message: '请选择异常类型', trigger: 'blur' }]">
        <el-select v-model="form.type" placeholder="请选择异常类型">
          <el-option label="动力" value="device_fault"></el-option>
          <el-option label="设备" value="network_issue"></el-option>
          <el-option label="环境" value="other"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReport">提交报备</el-button>
      </span>
  </el-dialog>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axiosInstance from '@/api/axiosConfig';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Plus, Warning, WarnTriangleFilled } from '@element-plus/icons-vue';

// 获取工单号
const route = useRoute();
const approveId = route.params.approve_id as string || '';
const isRemoteOpen = route.query.remoteOpen === 'true';
console.log("机房支持远程开门：" + isRemoteOpen);

if (!approveId) {
  ElMessage.error("工单号缺失，请从正确的页面进入");
}

// 异常报备表单数据
const form = ref({
  notes: '',
  type: ''
});
const reportDialogVisible = ref(false); // 控制弹窗显示与隐藏

// 打开异常报备的弹窗
const openReportDialog = () => {
  reportDialogVisible.value = true;
  console.log('报备弹窗打开请求已经调用！', reportDialogVisible.value);
};

// 重置表单
const resetForm = () => {
  form.value.notes = '';
  form.value.type = '';
};

const activeStep = ref(0); // 当前步骤
const canProceed = ref(false); // 是否可以进入下一步
const openDoorStatus = ref<string>(''); // 开门请求状态
const closeDoorStatus = ref<string>(''); // 关门请求状态

// 上传文件回调
const customUpload = (type: string) => {
  return (data: { file: Blob; approve_id: string }) => {
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
    formData.append("type", type);
    console.log("上传数据:", formData);

    // 调用后端接口
    axiosInstance
        .post('/open/photograph', formData, {
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
          const errorMessage = error.response?.data?.detail || '上传失败，请重试';
          ElMessage.error(errorMessage); // 显示错误信息
        });
  };
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
      activeStep.value = 2; // 开门请求成功后跳到施工中拍照
    }
    ElMessage.success(response.data.detail);
  } catch (error) {
    // 处理错误
    const errorMessage = error.response?.data?.detail || '开门请求错误：未知错误，您可以截图给开发者查看';
    ElMessage.error(errorMessage); // 显示错误信息
  }
};

// 提交异常报备
const submitReport = async () => {
  if (!form.value.notes || !form.value.type) {
    ElMessage.error("请填写所有字段");
    return;
  }

  try {
    const response = await axiosInstance.post('/approve/reporting', {
      approve_id: approveId,
      notes: form.value.notes,
      type: form.value.type
    });

    // 处理返回
    ElMessage.success(response.data.detail);
    dialogVisible.value = false; // 关闭弹窗
  } catch (error) {
    const errorMessage = error.response?.data?.detail || '报备失败，请重试';
    ElMessage.error(errorMessage); // 显示错误信息
  }
};

// 控制步骤
const nextStep = () => {
  if (activeStep.value < 4) {
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
