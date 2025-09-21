<script setup>
import { ref, inject, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import AppLayout from '@/layouts/AppLayout.vue'
import { setAuthHeader } from '@/axiosConfig.js'
import { tokenLogin } from '@/api'

const loadingConfig = inject('loadingConfig')
const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)
const { redirectPath, user } = storeToRefs(authStore)
const { auth, clearRedirectPath } = authStore
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
      const data = await tokenLogin(role, token)
      auth(data)
      const fallback = role === 'user' ? '/user/animallist' : '/hospital/animallist'
      const redirectTo = redirectPath.value || fallback
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
  await autoLogin()
})
</script>

<template>
  <v-app>
    <template v-if="user.isLogin">
    <AppLayout>
      <RouterView />
    <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
    </AppLayout>
    </template>
    <template v-else>
      <RouterView />
      <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
    </template>
  </v-app>
</template>
