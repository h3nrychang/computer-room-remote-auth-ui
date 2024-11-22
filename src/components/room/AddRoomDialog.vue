<template>
    <el-dialog
      title="添加机房"
      :visible.sync="dialogVisible"
      width="30%"
      @close="resetForm"
    >
      <el-form :model="newRoom" ref="form" :rules="rules" label-width="100px">
        <el-form-item label="机房名称" prop="name">
          <el-input v-model="newRoom.name" placeholder="请输入机房名称"></el-input>
        </el-form-item>
  
        <el-form-item label="机房地址" prop="address">
          <el-input v-model="newRoom.address" placeholder="请输入机房地址"></el-input>
        </el-form-item>
  
        <el-form-item label="管理员ID" prop="manager_id">
          <el-input v-model="newRoom.manager_id" placeholder="请输入管理员ID"></el-input>
        </el-form-item>
      </el-form>
  
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRoom">确 定</el-button>
      </span>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from '@/api/axiosConfig';
  import { ElMessage } from 'element-plus';
  
  // 弹框显示状态
  const dialogVisible = ref(false);
  
  // 新机房数据
  const newRoom = ref({
    name: '',
    address: '',
    manager_id: ''
  });
  
  // 表单校验规则
  const rules = {
    name: [{ required: true, message: '请输入机房名称', trigger: 'blur' }],
    address: [{ required: true, message: '请输入机房地址', trigger: 'blur' }],
    manager_id: [{ required: true, message: '请输入管理员ID', trigger: 'blur' }]
  };
  
  // 打开对话框
  defineExpose({
    openDialog() {
      openDialog.value.open(); // 打开弹窗的方法
    }
  });
  
  // 提交新机房数据
  const submitRoom = async () => {
    try {
      await axios.post('/room/create', newRoom.value);
      ElMessage.success('机房创建成功');
      dialogVisible.value = false;
      // 这里可以触发一个事件来通知父组件刷新机房列表
      $emit('refreshRoomList');
    } catch (error) {
      if (error.response && error.response.data.detail === 'No permission') {
        ElMessage.error('您没有权限创建机房');
      } else {
        ElMessage.error('添加机房失败');
      }
    }
  };
  
  // 重置表单
  const resetForm = () => {
    newRoom.value = {
      name: '',
      address: '',
      manager_id: ''
    };
  };

  </script>
  
  
  <style scoped>
  .dialog-footer {
    text-align: right;
  }
  </style>
  