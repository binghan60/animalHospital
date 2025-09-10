import { createRouter, createWebHistory } from 'vue-router'
import authStore from '@/stores/auth.js'
import { useToast } from 'vue-toastification'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/hospital',
      name: 'hospital',
      children: [
        { path: 'animallist', meta: { title: '醫院動物列表' }, component: () => import('@/views/hospital/AnimalListView.vue') },
        {
          path: 'animal/:id',
          name: 'animal-detail',
          meta: { title: '動物詳細資訊' },
          component: () => import('@/views/hospital/AnimalDetailView_New.vue'),
          props: true,
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          meta: { title: '管理面板' },
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
          meta: { title: '飼主動物列表' },
          component: () => import('@/views/user/AnimalListView.vue'),
        },
        {
          path: 'animal/:id',
          name: 'user-animal-detail',
          meta: { title: '動物詳細資訊' },
          component: () => import('@/views/hospital/AnimalDetailView_New.vue'),
          props: true, //將ID透過props傳入，而不是this.$route.params
        },
      ],
    },
    {
      path: '/',
      name: 'Home',
      meta: { title: '導覽頁' },
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: { title: '登入入口' },
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { title: '註冊會員' },
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/forget-password',
      name: 'forget-password',
      meta: { title: '忘記密碼' },
      component: () => import('@/views/ForgetPassword.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      meta: { title: '重設密碼' },
      component: () => import('@/views/ResetPassword.vue'),
    },
    {
      path: '/member',
      name: 'member-center',
      meta: { requiresAuth: true, title: '會員中心' },
      component: () => import('@/views/MemberCenter.vue'),
    },
    { path: '/:pathMatch(.*)*', name: 'notFound', meta: { title: '找不到該頁面' }, component: () => import('@/views/NotFountView.vue') },
  ],
})
// 進每個路由都會經過 路由守衛
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '動物健康管理系統'
  const store = authStore()
  const user = store.user
  const toast = useToast()
  // 檢查是否需要登入
  if (store.redirectPath == null) {
    store.setRedirectPath(to.fullPath)
  }
  if (to.meta.requiresAuth && !user.isLogin) {
    return next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    // 檢查權限
    toast.warning(`權限不足，無法進入 ${to.name}`, { timeout: 3000 })
    if (user.role == 'user') {
      return next('/user/animallist')
    }
    if (user.role == 'hospital') {
      return next('/hospital/animallist')
    }
  } else {
    next()
  }
})
export default router
