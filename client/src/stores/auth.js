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
