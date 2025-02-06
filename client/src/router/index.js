import { createRouter, createWebHistory } from 'vue-router'
import authStore from '@/stores/auth.js'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/hospital',
      name: 'hospital',
      children: [
        { path: 'animallist', component: () => import('@/views/hospital/AnimalListView.vue') },
        {
          path: 'animal/:id',
          name: 'animal-detail',
          component: () => import('@/views/hospital/AnimalDetailView.vue'),
          props: true,
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/hospital/DashboardView.vue'),
          props: true,
        },
      ],
      meta: { requiresAuth: true, roles: ['hospital'] },
    },
    {
      path: '/user',
      name: 'user',
      meta: { requiresAuth: true, roles: ['user'] },
      children: [
        {
          path: 'profile',
          name: 'user-profile',
          component: () => import('@/views/user/UserProfile.vue'),
        },
        {
          path: 'animallist',
          name: 'user-animal-list',
          component: () => import('@/views/user/AnimalListView.vue'),
        },
        {
          path: 'animal/:id',
          name: 'user-animal-detail',
          component: () => import('@/views/user/AnimalDetailView.vue'),
          props: true, //將ID透過props傳入，而不是this.$route.params
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/forget-password',
      name: 'forget-password',
      component: () => import('@/views/ForgetPassword.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPassword.vue'),
    },
  ],
})
// 進每個路由都會經過 路由守衛
router.beforeEach((to, from, next) => {
  const store = authStore()
  const user = store.user
  // 檢查是否需要登入
  if (to.meta.requiresAuth && !user.isLogin) {
    store.setRedirectPath(to.fullPath)
    next('/login') // 沒登入轉到LOGIN
  } else if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    // 檢查角色權限
    console.warn(`權限不足，${user.role} 無法進入 ${to.name}`)
    next('/login') // 跳轉到LOGIN
  } else {
    next()
  }
})
export default router
