<script>
import { RouterLink } from 'vue-router'
import { mapActions, mapState } from 'pinia'
import authStore from '@/stores/auth.js'
export default {
  components: {
    RouterLink,
  },
  data() {
    return {
      isMenuOpen: false,
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    chagnePage(path) {
      this.$router.push(path)
      this.isMenuOpen = false
    },
    logOut() {
      this.clearAuth()
      this.$router.push('/login')
      this.$toast.success('登出成功')
    },
    ...mapActions(authStore, ['clearAuth']),
  },
  computed: {
    ...mapState(authStore, ['user']),
  },
  mounted() {},
}
</script>
<template>
  <nav class="mb-0 lg:mb-8 bg-primary-400">
    <div class="flex items-center justify-between p-2 mx-auto text-lg text-white max-w-7xl">
      <RouterLink to="/dashboard" @click="isMenuOpen = false">
        <div class="flex items-center text-xl font-bold cursor-pointer">
          <img class="w-full h-full lg:max-w-[50px] max-w-[40px] pr-2" src="/logo.svg" alt="Logo" />
          <div class="hidden lg:block">
            {{ user.name }}
          </div>
        </div>
      </RouterLink>
      <div class="cursor-pointer lg:hidden" @click="toggleMenu"><span class="text-2xl">☰</span></div>
      <ul :class="['lg:flex lg:space-x-6 lg:space-y-0 absolute lg:static top-12 right-0 w-full text-center lg:w-auto transition-all duration-500 ease-out lg:max-h-full max-h-0 overflow-hidden', { 'max-h-72': isMenuOpen }]">
        <li class="relative z-10 flex items-center justify-center h-10 cursor-pointer bg-primary-400" @click="chagnePage('/animallist')">動物列表</li>
        <li class="relative z-10 flex items-center justify-center h-10 cursor-pointer bg-primary-400" @click="logOut">登出</li>
      </ul>
    </div>
  </nav>
</template>
