import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/views/Layout.vue';
import Login from '../views/Login.vue';
import NewLogin from '../views/NewLogin.vue';
import ApprovalPage from '../views/ApprovalPage.vue';
import UserList from '../views/UserList.vue';
import RoomList from '../views/RoomList.vue';  // 假设你已经创建了机房列表页面
import Approve from '../views/Approve.vue';
import ApproveList from '../views/ApproveList.vue';
import ApproveListPC from '../views/ApproveList.vue';
import ManagerList from '../views/ManagerList.vue';
import ApproveHistory from '../views/ApproveHistory.vue';
// 进入机房拍照的界面
import RoomEntry from '../views/room-entry/RoomEntry.vue';
// 用户管理
import ChangePassword from "@/views/users/ChangePassword.vue";
import ChangePhoneNumber from "@/views/users/ChangePhoneNumber.vue";


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/newlogin', component: NewLogin },
  {
    path: '/dashboard',
    component: Layout, // 使用布局组件，确保菜单不消失
    meta: { requiresAuth: true },
    children: [
      { path: '', component: ApprovalPage }, // 默认首页，新建机房审批+审批列表
      { path: '/users', component: UserList }, // 用户列表页面
      { path: '/changepassword', component: ChangePassword }, // 用户列表页面
      { path: '/changephonenumber', component: ChangePhoneNumber }, // 用户列表页面
      { path: '/room', component: RoomList }, // 机房列表页面
      { path: '/approvelistpc', component: ApproveListPC },
      { path: '/manager', component: ManagerList },
      { path: '/approvehistory', component: ApproveHistory },
      { path: '/roomentry/:approve_id', component: RoomEntry},
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
  const token = localStorage.getItem('access_token');
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
