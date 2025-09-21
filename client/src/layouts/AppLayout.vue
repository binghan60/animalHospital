<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useAppToast } from '@/utils/appToast'
import { useDisplay } from 'vuetify'

const router = useRouter()
const auth = useAuthStore()
const user = computed(() => auth.user)
const isDark = computed(() => auth.isDark)
const { mdAndDown } = useDisplay()

// Drawer 狀態：行動裝置預設關閉、桌面預設開啟
const drawer = ref(!mdAndDown.value)

// 監聽尺寸改變，自動切換 drawer 預設
watch(
  () => mdAndDown.value,
  val => {
    drawer.value = !val
  },
  { immediate: true },
)

const go = path => {
  router.push(path)
  if (mdAndDown.value) drawer.value = false
}

const logOut = () => {
  const toast = useAppToast()
  sessionStorage.setItem('manualLogout', 'true')
  if (auth.clearAuth()) {
    router.push('/login').finally(() => {
      setTimeout(() => sessionStorage.removeItem('manualLogout'), 1000)
    })
    toast.once('logout-success', 'success', '登出成功')
    if (mdAndDown.value) drawer.value = false
  }
}
const toggleTheme = () => {
  auth.toggleTheme()
}

const menuItems = computed(() => {
  const items = []
  if (user.value.isLogin) {
    if (user.value.role === 'hospital') {
      items.push({ title: '管理面板', to: '/hospital/dashboard', icon: 'mdi-view-dashboard' }, { title: '動物列表', to: '/hospital/animallist', icon: 'mdi-view-list' })
    }
    if (user.value.role === 'user') {
      items.push({ title: '動物列表', to: '/user/animallist', icon: 'mdi-view-list' })
    }
    items.push({ title: '會員中心', to: '/member', icon: 'mdi-account' })
  } else {
    items.push({ title: '首頁', to: '/', icon: 'mdi-home' })
  }
  return items
})
</script>

<template>
  <!-- AppLayout 不包 v-app，讓 App.vue 持有 v-app -->
  <v-app-bar elevation="2">
    <!-- 漢堡按鈕（行動裝置） -->
    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

    <!-- Logo 與名稱（點擊回首頁 / 儀表板） -->
    <v-btn variant="text" class="text-none" @click="user.role === 'hospital' ? go('/hospital/dashboard') : user.role === 'user' ? go('/user/animallist') : go('/')">
      <img src="/logo.svg" alt="Logo" height="28" class="mr-2" />
      <span v-if="user.name" class="font-weight-medium">{{ user.name }}</span>
    </v-btn>

    <v-spacer />

    <!-- 右側動作 -->
    <v-btn icon :aria-label="isDark ? '切換為淺色' : '切換為深色'" @click="toggleTheme">
      <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-moon-waxing-crescent'" />
    </v-btn>
    <v-btn v-if="user.isLogin" color="primary" class="ml-2 text-none" @click="logOut">登出</v-btn>
    <v-btn v-else color="primary" class="ml-2 text-none" @click="go('/login')">立即登入</v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" :permanent="!mdAndDown" :temporary="mdAndDown" elevation="2">
    <v-list density="comfortable">
      <v-list-item v-for="item in menuItems" :key="item.to" :to="item.to" link @click="mdAndDown ? (drawer = false) : null">
        <template #prepend>
          <v-icon :icon="item.icon" />
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <template #append>
      <v-divider />
      <div class="pa-3 d-flex align-center justify-space-between">
        <v-btn icon @click="toggleTheme"><v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-moon-waxing-crescent'" /></v-btn>
        <v-btn v-if="user.isLogin" variant="text" class="text-none" @click="logOut">登出</v-btn>
        <v-btn v-else variant="text" class="text-none" @click="go('/login')">登入</v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-main>
    <slot />
  </v-main>
</template>
