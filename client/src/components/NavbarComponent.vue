<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const auth = useAuthStore()
const user = computed(() => auth.user)
const isDark = computed(() => auth.isDark)

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const changePage = path => {
  router.push(path)
  toggleMenu()
}

const logOut = () => {
  if (auth.clearAuth()) {
    router.push('/login')
    window.$toast?.success?.('登出成功')
    toggleMenu()
  }
}
const handleClick = () => {
  auth.toggleTheme()
  toggleMenu()
}
</script>

<template>
  <nav class="transition-colors bg-primary-400 dark:bg-darkPrimary-500 h-[58px]">
    <div class="flex items-center justify-between h-full p-2 mx-auto text-lg text-white max-w-7xl">
      <RouterLink v-if="user.role === 'hospital'" to="/hospital/dashboard" @click="isMenuOpen = false">
        <div class="flex items-center text-xl font-bold cursor-pointer">
          <img class="w-full h-full lg:max-w-[50px] max-w-[40px] pr-2" src="/logo.svg" alt="Logo" />
          <div class="hidden lg:block">
            <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:origin-bottom after:scale-x-0 after:bg-darkPrimary-50 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom hover:after:scale-x-100">
              {{ user.name }}
            </button>
          </div>
        </div>
      </RouterLink>

      <RouterLink v-else-if="user.role === 'user'" to="/user/animallist" @click="isMenuOpen = false">
        <div class="flex items-center text-xl font-bold cursor-pointer">
          <img class="w-full h-full lg:max-w-[50px] max-w-[40px] pr-2" src="/logo.svg" alt="Logo" />
          <div class="hidden lg:block">
            <button role="link" class="block relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:origin-bottom after:scale-x-0 after:bg-darkPrimary-50 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom hover:after:scale-x-100">
              {{ user.name }}
            </button>
          </div>
        </div>
      </RouterLink>

      <RouterLink v-else to="/" @click="isMenuOpen = false">
        <div class="flex items-center text-xl font-bold cursor-pointer">
          <img class="w-full h-full lg:max-w-[50px] max-w-[40px] pr-2" src="/logo.svg" alt="Logo" />
          <div class="hidden lg:block">
            <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:origin-bottom after:scale-x-0 after:bg-darkPrimary-50 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom hover:after:scale-x-100"></button>
          </div>
        </div>
      </RouterLink>

      <div class="cursor-pointer lg:hidden" @click="toggleMenu">
        <span class="text-2xl">☰</span>
      </div>

      <ul :class="['lg:flex lg:space-x-6 lg:space-y-0 absolute lg:static top-12 right-0 w-full text-center lg:w-auto transition-all duration-500 ease-out lg:max-h-full max-h-0 overflow-hidden', { 'max-h-72': isMenuOpen }]">
        <li v-if="user.isLogin" class="relative z-10 flex items-center justify-center h-10 cursor-pointer select-none bg-primary-400 dark:bg-darkPrimary-500" @click="changePage('/member')">
          <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-darkPrimary-50 after:transition-transform after:duration-300">會員中心</button>
        </li>
        <li v-if="user.role === 'hospital' && user.isLogin" class="relative z-10 flex items-center justify-center h-10 cursor-pointer select-none bg-primary-400 dark:bg-darkPrimary-500" @click="changePage('/hospital/animallist')">
          <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-darkPrimary-50 after:transition-transform after:duration-300">動物列表</button>
        </li>
        <li v-if="user.role === 'user' && user.isLogin" class="relative z-10 flex items-center justify-center h-10 cursor-pointer select-none bg-primary-400 dark:bg-darkPrimary-500" @click="changePage('/user/animallist')">
          <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-darkPrimary-50 after:transition-transform after:duration-300">動物列表</button>
        </li>
        <li class="relative z-10 flex items-center justify-center h-10 cursor-pointer select-none bg-primary-400 dark:bg-darkPrimary-500" @click="handleClick">
          <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-darkPrimary-50 after:transition-transform after:duration-300">
            <i v-show="!isDark" class="fa-regular fa-sun fa-fw"></i>
            <i v-show="isDark" class="fa-regular fa-moon fa-fw"></i>
          </button>
        </li>
        <li v-if="user.isLogin" class="relative z-10 flex items-center justify-center h-10 cursor-pointer select-none bg-primary-400 dark:bg-darkPrimary-500" @click="logOut">
          <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-darkPrimary-50 after:transition-transform after:duration-300">登出</button>
        </li>
        <li v-if="!user.isLogin" class="relative z-10 flex items-center justify-center h-10 cursor-pointer select-none bg-primary-400 dark:bg-darkPrimary-500" @click="changePage('/login')">
          <button role="link" class="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-darkPrimary-50 after:transition-transform after:duration-300">立即登入</button>
        </li>
      </ul>
    </div>
  </nav>
</template>
