import { createRouter, createWebHistory } from 'vue-router'
import authStore from '@/stores/auth.js'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      children: [
        { path: 'animallist', component: () => import('@/views/AnimalListView.vue') },
        {
          path: 'animal/:id',
          name: 'animal-detail',
          component: () => import('@/views/AnimalDetailView.vue'),
          props: true,
        },
      ],
      meta: { requiresAuth: true },
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
    // {
    // path: '/about',
    // name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})
// 進每個路由都會經過 路由守衛
router.beforeEach((to, from, next) => {
  const store = authStore()
  if (to.meta.requiresAuth && !store.user.isLogin) {
    store.setRedirectPath(to.fullPath)
    next('/login')
  } else {
    next()
  }
})
export default router
