import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error
    
    // Handle authentication errors
    if (response && response.status === 401) {
      localStorage.removeItem('token')
      // In a real app, you would redirect to login page
      // window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)
export default api