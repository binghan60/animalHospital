<script>
import { RouterView } from 'vue-router'
import authStore from '@/stores/auth'
import apiStore from '@/stores/api'
import { mapState, mapActions } from 'pinia'
export default {
  components: { RouterView },
  data() {
    return {}
  },
  methods: {
    async autoLogin() {
      try {
        const cookies = document.cookie.split('; ')
        const tokenCookie = cookies.find(row => row.startsWith('animalHospitalToken='))
        const token = tokenCookie ? tokenCookie.split('=')[1] : null
        this.setToken(token)
        const response = await fetch(`${this.apipath}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const userData = await response.json()
          this.auth(userData) // 要補資料
          const redirectPath = this.redirectPath || '/animallist'
          this.clearRedirectPath()
          this.$router.push(redirectPath)
        }
      } catch (error) {
        console.error('自動登入失敗', error)
      }
    },
    ...mapActions(authStore, ['auth', 'clearRedirectPath', 'setToken']),
  },
  computed: {
    ...mapState(authStore, ['redirectPath']),
    ...mapState(apiStore, ['apipath']),
  },
  mounted() {
    this.autoLogin()
    //axios自動帶token
    // const token = document.cookie.replace(/(?:(?:^|.*;\s*)Token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // axios.defaults.headers.common.Authorization = token;
  },
}
</script>

<template>
  <RouterView></RouterView>
</template>
