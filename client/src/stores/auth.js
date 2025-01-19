import { defineStore } from 'pinia'

export default defineStore('authStore', {
  state: () => ({
    user: {
      __v: '',
      role: '',
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
      expiresAt: '',
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
      document.cookie = 'animalHospitalToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'animalHospitalRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
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
