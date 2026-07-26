import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure there is no slash at the end
})

instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default instance
