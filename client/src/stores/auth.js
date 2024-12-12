import { defineStore } from 'pinia'

export default defineStore('authStore', {
  state: () => ({
    user: {},
  }),
  actions: {
    auth(user) {
      this.user = user
      this.user.isLogin = true
    },
    clearAuth() {
      this.user = {}
    },
  },
})
