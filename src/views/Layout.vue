<template>
  <div class="app-wrapper">
    <el-container class="main-container">
      <!-- 菜单栏 (仅在电脑显示) -->
      <el-aside
          v-if="isDesktop"
          :width="200"
          class="sidebar-container"
      >
        <Menu /> <!-- 左侧菜单 -->
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-container class="right-container">
        <el-header><Header /></el-header>
        <el-main class="main-content">
          <!-- 路由视图，动态显示页面内容 -->
          <router-view />
        </el-main>
        <!-- 固定底部导航栏 (仅在手机显示) -->
        <el-footer
            v-if="isMobile"
            class="bottom-nav"
        >
          <Tabs /> <!-- 引入底部导航栏组件 -->
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Menu from "@/views/menu"
import Header from "@/views/header"
import Tabs from "@/views/tabs"

// 检测设备状态
const isMobile = ref(false)
const isDesktop = ref(true)

// 检查屏幕宽度以确定设备类型
const checkDeviceType = () => {
  const width = window.innerWidth
  isMobile.value = width <= 768 // 手机模式：宽度小于等于768px
  isDesktop.value = width > 768 // 桌面模式：宽度大于768px
}

onMounted(() => {
  checkDeviceType()
  window.addEventListener("resize", checkDeviceType) // 监听屏幕大小变化
})

onUnmounted(() => {
  window.removeEventListener("resize", checkDeviceType)
})
</script>


<style scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
}

.sidebar-container {
  background-color: #2d3a4b;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s ease; /* 添加过渡效果 */
}

.right-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100vh;
}

el-header {
  background-color: #f4f4f4;
}

.main-content {
  flex-grow: 1;
  background-color: #f9f9f9;
  padding: 20px;
  overflow-y: auto;
}

.bottom-nav {
  background-color: #2d3a4b;
  position: fixed; /* 固定位置 */
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px; /* 底部导航栏高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 保证在最前面 */
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}
</style>
