<template>
    <div class="common-layout">
      <el-container>
        <Aside />
        <el-container>
          <Header />
          <Main />
          <Footer />
        </el-container>
      </el-container>
    </div>
  </template>
  
  <script>
  import Aside from './Aside.vue';
  import Header from './Header.vue';
  import Main from './Main.vue';
  import Footer from './Footer.vue';
  
  export default {
    components: {
      Aside,
      Header,
      Main,
      Footer
    }
  };
  </script>
  
  <style scoped>
  /* 可以在这里添加布局相关样式 */
  </style>
  