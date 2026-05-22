import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: '主页',
    //   component: () => import('@/views/Home.vue'),
    // },
    {
      path: '/user/login',
      name: '用户登录',
      component: () => import('@/views/user/UserLoginView.vue'),
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import('@/views/user/UserRegisterView.vue'),
    },
    {
      path: '/article/create',
      name: '文章创作',
      component: () => import('@/views/article/ArticleCreateVIew.vue'),
    },
  ],
})

export default router
