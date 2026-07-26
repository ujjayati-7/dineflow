'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

   useEffect(() => {
     const token = searchParams.get('token')
     if (token) {
       localStorage.setItem('token', token)

       // Fetch the actual user data using the new token
       const fetchUser = async () => {
         try {
           const res = await axios.get('/auth/me')
           localStorage.setItem('user', JSON.stringify(res.data))
           toast.success('Logged in with Google!')

           // Redirect based on actual role
           if (res.data.role === 'customer') {
             router.push('/')
           } else {
             router.push('/staff')
           }
         } catch (error) {
           toast.error('Failed to fetch user profile')
           router.push('/')
         }
       }

       fetchUser()
     }
   }, [searchParams, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      toast.success('Logged in successfully!')
      if (res.data.role === 'customer') {
        router.push('/')
      } else {
        router.push('/staff')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-zinc-900 p-8 rounded-3xl shadow-xl border border-amber-500/20 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-amber-500/10 p-3 rounded-2xl mb-4 border border-amber-500/30">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold font-serif">
              D
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">
            Welcome to DineFlow
          </h1>
          <p className="text-gray-500 mt-1">
            Sign in to order and manage your experience
          </p>
        </div>

        <a
          href="http://localhost:5000/api/auth/google"
          className="w-full flex items-center justify-center gap-3 bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 p-3.5 rounded-xl font-semibold hover:bg-zinc-800/50 transition mb-6 text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </a>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-zinc-900 px-4 text-gray-500 text-xs uppercase tracking-wider">
              Or
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-white"
              placeholder="Email address"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-white"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 text-black p-3.5 rounded-xl font-semibold hover:bg-amber-400 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
