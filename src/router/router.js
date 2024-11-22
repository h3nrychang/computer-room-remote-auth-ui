import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/views/Layout.vue';
// import Login from '../views/Login.vue';
import Dashboard from '../views/dashboard.vue';
import UserList from '../views/UserList.vue';
import RoomList from '../views/RoomList.vue';
import Approve from '../views/Approve.vue';
import ApproveList from '../views/ApproveList.vue';
import ApproveListPC from '../views/ApproveList.vue';
import ManagerList from '../views/ManagerList.vue';

// 这个没用了


const routes = [
  { path: '/', redirect: '/login' }, 
  { path: '/login', component: Login },
  {
    path: '/dashboard',
    component: Layout, // 使用布局组件，确保菜单不消失
    meta: { requiresAuth: true },
    children: [
      { path: '', component: Dashboard }, // 默认显示Dashboard组件
      { path: '/users', component: UserList }, // 用户列表页面
      { path: '/room', component: RoomList }, // 机房列表页面
      { path: '/approvelistpc', component: ApproveListPC },
      { path: '/manager', component: ManagerList },

    ]
  },
  { path: '/approve', component: Approve },
  { path: '/approvelist', component: ApproveList },


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  if (!token && to.name !== 'Login') {
    next({ name: 'Login' })
  } else {
    next()
  }
});

export default router;
