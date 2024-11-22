<template>
  <div class="app-wrapper">
    <el-container class="main-container">
      <!-- 菜单栏 -->
      <el-aside :width="isMobile ? '50px' : '200px'" class="sidebar-container"
                :style="{ display: isMobile && !isMenuExpanded ? 'none' : 'block' }">
        <Menu/> <!-- 左侧菜单 -->
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-container class="right-container">
        <el-header><Header @toggle-menu="isMenuExpanded = $event" /></el-header>
        <el-main>
          <!-- 路由视图，动态显示页面内容 -->
          <router-view />
        </el-main>
        <el-footer><Footer /></el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Menu from "@/views/menu"
import Header from "@/views/header"
import Footer from "@/views/footer"

const isMobile = ref(false)
const isMenuExpanded = ref(true) // 控制菜单展开和收起

// 检查屏幕宽度
const checkIsMobile = () => {
  isMobile.value = window.matchMedia("(max-width: 768px)").matches
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener("resize", checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile)
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

el-main {
  flex-grow: 1;
  background-color: #f9f9f9;
  padding: 20px;
}

el-footer {
  background-color: #f1f1f1;
  padding: 10px;
}
</style>
