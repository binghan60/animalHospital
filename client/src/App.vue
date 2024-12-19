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
      const cookies = document.cookie.split('; ')
      const tokenCookie = cookies.find(row => row.startsWith('animalHospitalToken='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : null
      if (token) {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_PATH}/user/login`,
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
