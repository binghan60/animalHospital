<script>
import { RouterView } from 'vue-router'
import authStore from '@/stores/auth'
import { mapState, mapActions } from 'pinia'
import axios from 'axios'
import NavbarComponent from '@/components/NavbarComponent.vue'

export default {
  inject: ['loadingConfig'],
  components: { NavbarComponent, RouterView },
  data() {
    return { isLoading: false }
  },
  methods: {
    async autoLogin() {
      const token = this.getCookieValue('animalHospitalToken')
      const role = this.getCookieValue('animalHospitalRole')
      if (token) {
        try {
          this.isLoading = true
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
          this.auth(data)
          const redirectPath = this.redirectPath || '/hospital/animallist'
          this.$router.push(redirectPath)
          this.clearRedirectPath()
          axios.defaults.headers.common.Authorization = `Bearer ${token}`
          this.isLoading = false
        } catch {
          // this.$toast.error(error.response.data.message)
          this.isLoading = false
        }
      }
    },
    getCookieValue(name) {
      const cookies = document.cookie.split('; ')
      for (const cookie of cookies) {
        const [key, value] = cookie.split('=')
        if (key === name) {
          return decodeURIComponent(value)
        }
      }
      return null
    },
    ...mapActions(authStore, ['auth', 'clearRedirectPath', 'toggleTheme']),
  },
  computed: {
    ...mapState(authStore, ['redirectPath', 'isDark']),
  },
  async mounted() {
    await this.autoLogin()
    if (localStorage.getItem('animalHospitalDarkTheme') === 'true') {
      this.toggleTheme()
    }
    //axios自動帶token
    // const token = document.cookie.replace(/(?:(?:^|.*;\s*)Token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // axios.defaults.headers.common.Authorization = token;
  },
}
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
