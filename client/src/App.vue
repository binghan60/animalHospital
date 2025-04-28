<script setup>
import { ref, inject, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import NavbarComponent from '@/components/NavbarComponent.vue'
import { setAuthHeader } from '@/axiosConfig.js'
import { useToast } from 'vue-toastification'

const loadingConfig = inject('loadingConfig')
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const isLoading = ref(false)
const { redirectPath } = storeToRefs(authStore)
const { auth, clearRedirectPath, toggleTheme } = authStore
// 方法
function getCookieValue(name) {
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=')
    if (key === name) {
      return decodeURIComponent(value)
    }
  }
  return null
}
async function autoLogin() {
  const token = getCookieValue('animalHospitalToken')
  const role = getCookieValue('animalHospitalRole')
  if (token) {
    try {
      isLoading.value = true
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_PATH}/${role}/tokenLogin`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )
      auth(data)
      const redirectTo = redirectPath.value || '/hospital/animallist'
      router.push(redirectTo)
      clearRedirectPath()
      setAuthHeader(token)
      isLoading.value = false
    } catch {
      isLoading.value = false
    }
  }
}
onMounted(async () => {
  if (localStorage.getItem('animalHospitalDarkTheme') === 'true') {
    toggleTheme()
  }
  await autoLogin()
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 444) {
        if (!sessionStorage.getItem('hasShownError')) {
          sessionStorage.setItem('hasShownError', 'true')
          const store = useAuthStore()
          toast.warning('密碼已修改，請重新登入')
          store.clearAuth()
          router.push('/login')
        }
        return Promise.resolve()
      }
      sessionStorage.removeItem('hasShownError')
      return Promise.reject(error)
    },
  )
})
</script>

<template>
  <div class="transition-colors bg-primary-50 dark:bg-darkPrimary-800">
    <NavbarComponent></NavbarComponent>
    <div class="p-4 mx-auto max-w-7xl lg:pt-8 lg:pb-8" style="min-height: calc(100vh - 58px)">
      <RouterView />
    </div>
    <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
  </div>
</template>
