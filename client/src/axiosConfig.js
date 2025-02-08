import axios from 'axios'

export function setAuthHeader(token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default axios
