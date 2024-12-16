<script>
import { mapActions, mapState } from 'pinia'
import authStore from '@/stores/auth.js'
export default {
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
      this.$router.push('/')
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
  <nav class="mb-10 bg-primary-400">
    <div class="flex items-center justify-between p-2 mx-auto text-lg text-white max-w-7xl">
      <a @click="chagnePage('/')">
        <div class="text-2xl font-bold cursor-pointer">
          LOGO
          <!-- <img class="w-auto h-full" src="/img/logo.png" alt="Logo" /> -->
        </div>
      </a>
      <div class="lg:hidden" @click="toggleMenu"><span class="text-2xl">☰</span></div>
      <ul :class="['lg:flex lg:space-x-6 lg:space-y-0 absolute lg:static top-12 right-0 w-full text-center lg:w-auto transition-all duration-500 ease-out lg:max-h-full max-h-0 overflow-hidden', { 'max-h-72': isMenuOpen }]">
        <li @click="chagnePage('/animallist')" class="relative z-10 flex items-center justify-center h-10 cursor-pointer bg-primary-400">動物列表</li>
        <li class="relative z-10 flex items-center justify-center h-10 bg-primary-400">{{ user.username + (user.title ? user.title : '') }}</li>
        <li @click="logOut" class="relative z-10 flex items-center justify-center h-10 cursor-pointer bg-primary-400">登出</li>
      </ul>
    </div>
  </nav>
</template>
