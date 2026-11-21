import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    // An expired or invalid token on a protected request signs the user out.
    if (status === 401 && localStorage.getItem('token') && !url.startsWith('/auth/')) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:expired'))
    }

    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : error.message) ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  }
)

export default api