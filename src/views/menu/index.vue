<template>
  <el-menu
    active-text-color="#A0C1FF"
    background-color="#2D3A4B"
    class="el-menu-vertical-demo"
    text-color="#fff"
     height="100%"
    router
    :default-active="activeMenu" 
    @select="handleSelect"

    v-loading="loading" 
    element-loading-text="数据正在赶来的路上..." 
    :data="users" 
    style="width: 100%"
  >
    <el-menu-item index="/dashboard"><el-icon><DataLine /></el-icon>Dashboard</el-menu-item>

    <el-sub-menu index="1">
      <template #title>
        <el-icon><Key /></el-icon>
        <span>系统用户管理</span>
      </template>
      <el-menu-item v-if="roleID == 1" index="/users">用户列表</el-menu-item>
      <el-menu-item index="/changepassword">修改密码</el-menu-item>
      <el-menu-item index="/changephonenumber">换绑手机</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="2" v-if="roleID == 1">
      <template #title>
        <el-icon><User /></el-icon>
        <span>机房长管理</span>
      </template>
      <el-menu-item index="/manager">机房长列表</el-menu-item>
      <!-- <el-menu-item index="1-2">修改密码</el-menu-item> -->
      <!-- <el-menu-item index="1-3">密码重置</el-menu-item> -->
    </el-sub-menu>

    <el-sub-menu index="3" v-if="roleID == 1">
      <template #title>
        <el-icon><Cpu /></el-icon>
        <span>机房管理</span>
      </template>
      <el-menu-item index="/room">机房列表</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="4" v-if="roleID == 1">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>审批管理</span>
      </template>
      <el-menu-item index="/approvelistpc">待审工单</el-menu-item>
      <el-menu-item index="/approvehistory">历史工单</el-menu-item>
    </el-sub-menu>
<!-- 
    <el-sub-menu index="5">
      <template #title>
        <el-icon><Document /></el-icon>
        <span></span>
      </template>
      <el-menu-item index="/approvelistpc">待审工单</el-menu-item>
      <el-menu-item index="/approvehistory">历史工单</el-menu-item>
    </el-sub-menu> -->

<!--    <el-menu-item index="/about">-->
<!--      <el-icon><icon-menu /></el-icon>-->
<!--      <span>关于</span>-->
<!--    </el-menu-item>-->
  </el-menu>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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

// 初次加载时获取用户角色
onMounted(() => {
  getUserRole();
});
</script>

<style lang="scss" scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-dark-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
