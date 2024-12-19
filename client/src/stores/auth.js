import { defineStore } from 'pinia'

export default defineStore('authStore', {
  state: () => ({
    user: {
      __v: '',
      _id: '',
      username: '',
      title: '',
      nickname: '',
      email: '',
      message: '',
      admin: '',
      isLogin: false,
      isActive: '',
      token: '',
      expired: '',
      createdAt: '',
      updatedAt: '',
    },
    redirectPath: null,
    token: '',
  }),
  actions: {
    auth(user) {
      this.user = user
      this.user.isLogin = true
    },
    clearAuth() {
      this.user = {}
      this.redirectPath = null
    },
    setRedirectPath(path) {
      this.redirectPath = path
    },
    clearRedirectPath() {
      this.redirectPath = null
    },
    setToken(token) {
      this.token = token
    },
  },
})
