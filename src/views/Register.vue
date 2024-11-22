<template>
  <div class="register-page">
    <h2>注册</h2>
    <AuthForm :isLogin="false" />
  </div>
</template>

<script>
import AuthForm from '../components/AuthForm.vue';

export default {
  components: {
    AuthForm,
  },
};
</script>
