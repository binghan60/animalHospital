import axios from 'axios'
import { useAuthStore } from '@/stores/auth' // Adjust the path if needed
import { useAppToast } from '@/utils/appToast' // unified toast wrapper
import router from '@/router' // Import the router instance

const http = axios.create({
  baseURL: import.meta.env.VITE_API_PATH,
})

export function setAuthHeader(token) {
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
export function clearAuthHeader() {
  delete http.defaults.headers.common.Authorization
}
// Attach token from cookie automatically if not already set
http.interceptors.request.use(config => {
  if (typeof document !== 'undefined' && !config.headers?.Authorization) {
    const cookies = document.cookie.split('; ').map(c => c.split('='))
    const tokenPair = cookies.find(([k]) => k === 'animalHospitalToken')
    if (tokenPair && tokenPair[1]) {
      const token = decodeURIComponent(tokenPair[1])
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

http.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status
    const store = useAuthStore()
    const toast = useAppToast()

    const redirectKey = 'hasAuthRedirected'

    const doLogoutAndRedirect = (messageKey, messageText) => {
      toast.once(messageKey, 'warning', messageText)
      if (!sessionStorage.getItem(redirectKey)) {
        sessionStorage.setItem(redirectKey, 'true')
        try {
          store.clearAuth()
        } catch {}
        try {
          clearAuthHeader()
        } catch {}
        router.push('/login').finally(() => {
          // allow future redirects in next navigation cycle
          setTimeout(() => sessionStorage.removeItem(redirectKey), 1000)
        })
      }
    }

    if (sessionStorage.getItem('manualLogout')) {
      return Promise.reject(error)
    }

    if (status === 444) {
      doLogoutAndRedirect('auth-password-changed', '密碼已修改，請重新登入')
      return Promise.reject(error)
    }

    if (status === 401 || status === 403) {
      doLogoutAndRedirect('auth-expired-or-forbidden', '登入已過期或權限不足，請重新登入')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default http
