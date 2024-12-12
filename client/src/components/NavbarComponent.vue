<script>
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
  },
}
</script>

<template>
  <nav class="bg-primary-400">
    <div class="flex items-center justify-between p-2 mx-auto text-lg text-white max-w-7xl">
      <a @click="chagnePage('/')">
        <div class="text-2xl font-bold cursor-pointer">
          LOGO
          <!-- <img class="w-auto h-full" src="/img/logo.png" alt="Logo" /> -->
        </div>
      </a>
      <div class="lg:hidden" @click="toggleMenu">
        <span class="text-2xl">☰</span>
      </div>
      <ul :class="['lg:flex lg:space-x-6 lg:space-y-0 absolute lg:static top-12 right-0 w-full text-center lg:w-auto transition-all duration-500 ease-out lg:max-h-full max-h-0 overflow-hidden', { 'max-h-72': isMenuOpen }]">
        <li @click="chagnePage('/styleGuild')" class="relative z-50 flex items-center justify-center h-12 cursor-pointer bg-primary-400">展示中心</li>
        <li @click="chagnePage('/productlist')" class="relative z-50 flex items-center justify-center h-12 cursor-pointer bg-primary-400">商品列表</li>
        <li @click="chagnePage('/cart')" class="relative z-50 flex items-center justify-center h-12 cursor-pointer bg-primary-400">購物車</li>
        <li @click="chagnePage('/member')" class="relative z-50 flex items-center justify-center h-12 cursor-pointer bg-primary-400">會員中心</li>
      </ul>
    </div>
  </nav>
</template>
