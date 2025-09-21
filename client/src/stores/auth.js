import { defineStore } from 'pinia'
import { ref } from 'vue'
import { clearAuthHeader } from '@/axiosConfig.js'

const initialUser = {
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
}

export const useAuthStore = defineStore('authStore', () => {
  const user = ref({ ...initialUser })
  const redirectPath = ref(null)
  const token = ref('')
  const isDark = ref(JSON.parse(localStorage.getItem('animalHospitalDarkTheme') || 'false'))
  function auth(userData) {
    user.value = userData
    user.value.isLogin = true
  }
  function clearAuth() {
    if (user.value.isLogin) {
      user.value = { ...initialUser }
      redirectPath.value = null
      document.cookie = 'animalHospitalToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'animalHospitalRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      try { clearAuthHeader() } catch {}
      return 1
    } else {
      return 0
    }
  }
  function setRedirectPath(path) {
    redirectPath.value = path
  }
  function clearRedirectPath() {
    redirectPath.value = null
  }
  function toggleTheme() {
    isDark.value = !isDark.value
    document.querySelector('body').classList.toggle('dark', isDark.value)
    localStorage.setItem('animalHospitalDarkTheme', JSON.stringify(isDark.value))
  }
  return {
    user,
    redirectPath,
    token,
    isDark,
    auth,
    clearAuth,
    setRedirectPath,
    clearRedirectPath,
    toggleTheme,
  }
})
export default useAuthStore
