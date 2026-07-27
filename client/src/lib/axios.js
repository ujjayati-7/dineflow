import axios from 'axios'

// Hardcode your live Render URL here
const API_URL = 'https://dineflow-api-3nh3.onrender.com/api' // <--- REPLACE WITH YOUR RENDER URL + /api

const instance = axios.create({
  baseURL: API_URL,
})

// Automatically attach the JWT token to every request
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
