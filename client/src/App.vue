<script>
import { RouterView } from 'vue-router'
import authStore from '@/stores/auth'
import { mapState, mapActions } from 'pinia'
import axios from 'axios'
import NavbarComponent from '@/components/NavbarComponent.vue'
import { setAuthHeader } from '@/axiosConfig.js'

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
          setAuthHeader(token)
          this.isLoading = false
        } catch {
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
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 444) {
          if (!sessionStorage.getItem('hasShownError')) {
            sessionStorage.setItem('hasShownError', 'true')
            const store = authStore()
            this.$toast.warning('密碼已修改，請重新登入')
            store.clearAuth()
            this.$router.push('/login')
          }
          return Promise.resolve()
        }
        sessionStorage.removeItem('hasShownError')
        return Promise.reject(error)
      },
    )
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
