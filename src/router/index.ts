import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BasicLayout,
      children: [
        {
          path: '',
          name: '主页',
          redirect: '/article/create',
        },
        {
          path: '/article/create',
          name: '文章创作',
          component: () => import('@/views/article/ArticleCreateVIew.vue'),
        },
        {
          path: '/article/list',
          name: '文章列表',
          component: () => import('@/views/article/ArticleListView.vue'),
        },
        {
          path: '/article/:taskId',
          name: '文章详情',
          component: () => import('@/views/article/ArticleDetailView.vue'),
        },
      ],
    },
    {
      path: '/user',
      children: [
        {
          path: 'login',
          name: '用户登录',
          component: () => import('@/views/user/UserLoginView.vue'),
        },
        {
          path: 'register',
          name: '用户注册',
          component: () => import('@/views/user/UserRegisterView.vue'),
        },
      ],
    },
    {
      path: '/vip',
      name: '用户升级',
      component: () => import('@/views/vip/VipView.vue'),
    },
  ],
})

export default router
