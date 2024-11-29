<template>
  <el-menu
      v-if="!loading"
      :default-active="activeMenu"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#2D3A4B"
      text-color="#fff"
      active-text-color="#A0C1FF"
      @select="handleSelect"
      router
      style="width: 100%"
  >
    <el-menu-item index="/dashboard">申请</el-menu-item>

    <el-sub-menu index="1" v-if="roleID == 1">
      <template #title>
        <span>审批</span>
      </template>
      <el-menu-item index="/approvelistpc">待审工单</el-menu-item>
      <el-menu-item index="/approvehistory">历史工单</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="2">
      <template #title>
        <span>我的</span>
      </template>
      <el-menu-item index="/changepassword">修改密码</el-menu-item>
      <el-menu-item index="/changephonenumber">换绑手机</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="3" v-if="roleID == 1">
      <template #title>
        <span>管理</span>
      </template>
      <el-menu-item index="/room">机房管理</el-menu-item>
      <el-menu-item index="/room">机房管理</el-menu-item>
      <el-menu-item index="/manager">机房长管理</el-menu-item>
      <el-menu-item index="/users">用户管理</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>


import {ref, onMounted, nextTick} from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/api/axiosConfig'; // 导入axios配置

const router = useRouter();
const activeMenu = ref('/dashboard'); // 默认选中的菜单项
const roleID = ref(null);
const loading = ref(true);

// 获取用户角色
const getUserRole = async () => {
  try {
    const response = await axios.get('/users/me/role');
    console.log('获取用户角色成功', response.data.id);
    roleID.value = response.data.id;
    loading.value = false;
  } catch (error) {
    console.error('获取用户角色失败', error);
  }
};

// 处理菜单项的点击事件，改变路由
const handleSelect = (index) => {
  activeMenu.value = index;  // 更新当前选中的菜单项
  router.push(index);  // 跳转到对应的路由
};

// 获取用户角色
onMounted(() => {
  getUserRole();
});
</script>

<style lang="scss">
.el-menu-demo {
  width: 100%;
  border: none;
}
.el-menu--horizontal.el-menu {
  --el-menu-border-color: transparent; // 设置边框颜色为透明
  border-bottom: none; // 确保没有底部边框
}
</style>