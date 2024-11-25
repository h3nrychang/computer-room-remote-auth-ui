<template>
  <div class="header">
<!--    <el-icon @click="toggleMenu" class="menu-toggle-icon">-->
<!--        <component :is="isMenuExpanded ? 'Fold' : 'Expand'" />-->
<!--      </el-icon>-->
    <div class="header-left">机房门禁管理系统</div>
    <div class="header-right">

      <span class="username">{{ username }}</span>
      <el-button @click="handleLogout" :icon="SwitchButton" type="danger" size="small"></el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/api/axiosConfig'
import {Expand, Fold, SwitchButton} from '@element-plus/icons-vue'

const username = ref('')
const router = useRouter()
const isMenuExpanded = ref(true)  // 控制菜单是否展开

// 切换菜单展开状态
const toggleMenu = () => {
  isMenuExpanded.value = !isMenuExpanded.value
  // 向父组件发出事件，将菜单的展开状态传递出去
  emit('toggle-menu', isMenuExpanded.value)
}

// 获取用户名
const fetchUsername = async () => {
  try {
    const response = await axios.get('/users/me')
    username.value = response.data.username
  } catch (error) {
    console.error('获取用户名失败', error)
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('access_token')
  router.push('/login')
}

// 页面加载时获取用户名
onMounted(() => {
  fetchUsername()
})
</script>

<style lang="scss" scoped>
.header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.header-left {
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
}

.menu-toggle-icon {
  cursor: pointer;
  margin-right: 15px;
}

.username {
  margin-right: 15px;
}
</style>
