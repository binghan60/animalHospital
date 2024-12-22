<script>
import { RouterView } from 'vue-router'
import authStore from '@/stores/auth'
import { mapState, mapActions } from 'pinia'
import axios from 'axios'
export default {
  components: { RouterView },
  data() {
    return {}
  },
  methods: {
    async autoLogin() {
      const token = this.getCookieValue('animalHospitalToken')
      const role = this.getCookieValue('animalHospitalRole')
      if (token) {
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
        const redirectPath = this.redirectPath || '/animallist'
        this.$router.push(redirectPath)
        this.clearRedirectPath()
        axios.defaults.headers.common.Authorization = `Bearer ${token}`
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
    ...mapActions(authStore, ['auth', 'clearRedirectPath', 'setToken']),
  },
  computed: {
    ...mapState(authStore, ['redirectPath']),
  },
  async mounted() {
    await this.autoLogin()
    //axios自動帶token
    // const token = document.cookie.replace(/(?:(?:^|.*;\s*)Token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // axios.defaults.headers.common.Authorization = token;
  },
}
</script>

<template>
  <RouterView></RouterView>
</template>
