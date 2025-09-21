<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useAppToast } from '@/utils/appToast'

const router = useRouter()
const auth = useAuthStore()
const user = computed(() => auth.user)
const isDark = computed(() => auth.isDark)

const menu = ref(false)

const go = path => {
  router.push(path)
  menu.value = false
}

const logOut = () => {
  const toast = useAppToast()
  sessionStorage.setItem('manualLogout', 'true')
  if (auth.clearAuth()) {
    router.push('/login').finally(() => {
      setTimeout(() => sessionStorage.removeItem('manualLogout'), 1000)
    })
    toast.once('logout-success', 'success', '登出成功')
    menu.value = false
  }
}
const toggleTheme = () => {
  auth.toggleTheme()
}
</script>

<template>
  <v-app-bar elevation="2">
    <v-btn variant="text" class="text-none" @click="user.role === 'hospital' ? go('/hospital/animallist') : user.role === 'user' ? go('/user/animallist') : go('/')">
      <img src="/logo.svg" alt="Logo" height="32" class="mr-2" />
      <span v-if="user.name" class="font-weight-medium">{{ user.name }}</span>
    </v-btn>

    <v-spacer />

    <!-- Desktop actions -->
    <div class="d-none d-md-flex align-center">
      <v-btn v-if="user.isLogin" variant="text" class="text-none" @click="go('/member')">會員中心</v-btn>
      <v-btn v-if="user.role === 'hospital' && user.isLogin" variant="text" class="text-none" @click="go('/hospital/animallist')">動物列表</v-btn>
      <v-btn v-if="user.role === 'user' && user.isLogin" variant="text" class="text-none" @click="go('/user/animallist')">動物列表</v-btn>
      <v-btn icon :aria-label="isDark ? '切換為淺色' : '切換為深色'" @click="toggleTheme">
        <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-moon-waxing-crescent'" />
      </v-btn>
      <v-btn v-if="user.isLogin" color="primary" variant="elevated" class="ml-2 text-none" @click="logOut">登出</v-btn>
      <v-btn v-else color="primary" variant="elevated" class="ml-2 text-none" @click="go('/login')">立即登入</v-btn>
    </div>

    <!-- Mobile menu -->
    <div class="d-md-none">
      <v-menu v-model="menu" :close-on-content-click="true" location="bottom right">
        <template #activator="{ props }">
          <v-btn icon v-bind="props"><v-icon icon="mdi-menu" /></v-btn>
        </template>
        <v-list>
          <v-list-item v-if="user.isLogin" @click="go('/member')">會員中心</v-list-item>
          <v-list-item v-if="user.role === 'hospital' && user.isLogin" @click="go('/hospital/animallist')">動物列表</v-list-item>
          <v-list-item v-if="user.role === 'user' && user.isLogin" @click="go('/user/animallist')">動物列表</v-list-item>
          <v-list-item @click="toggleTheme">
            <v-list-item-title>{{ isDark ? '切換為淺色' : '切換為深色' }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item v-if="user.isLogin" @click="logOut">登出</v-list-item>
          <v-list-item v-else @click="go('/login')">立即登入</v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>
