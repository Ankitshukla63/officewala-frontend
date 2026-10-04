import axios from 'axios'
import { getApiBaseUrl } from './network'

export const api = axios.create({ baseURL: getApiBaseUrl() })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => {
    // If response body is ApiResponse { success, message, data }, unwrap the data payload
    if (r.data && typeof r.data === 'object' && 'success' in r.data && 'data' in r.data) {
      return { ...r, data: r.data.data }
    }
    return r
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ow_token')
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)
