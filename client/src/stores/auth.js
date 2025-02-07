import { defineStore } from 'pinia'

export default defineStore('authStore', {
  state: () => ({
    user: {
      __v: '',
      role: '',
      _id: '',
      name: '',
      email: '',
      message: '',
      isLogin: false,
      isActive: '',
      token: '',
      expiresAt: '',
      createdAt: '',
      updatedAt: '',
    },
    redirectPath: null,
    token: '',
    isDark: false,
  }),
  actions: {
    auth(user) {
      this.user = user
      this.user.isLogin = true
    },
    clearAuth() {
      if (this.user.isLogin) {
        this.user = {}
        this.redirectPath = null
        document.cookie = 'animalHospitalToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'animalHospitalRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        return 1
      } else {
        return 0
      }
    },
    setRedirectPath(path) {
      this.redirectPath = path
    },
    clearRedirectPath() {
      this.redirectPath = null
    },
    toggleTheme() {
      this.isDark = !this.isDark
      document.querySelector('body').classList.toggle('dark', this.isDark)
      localStorage.setItem('animalHospitalDarkTheme', JSON.stringify(this.isDark))
    },
  },
})
