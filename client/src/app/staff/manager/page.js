'use client'
import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function ManagerDashboard() {
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/orders/analytics')
        setAnalytics(res.data)
      } catch (error) {
        console.error(
          'Failed to fetch analytics:',
          error.response?.data?.message || error.message,
        )
      }
    }
    fetchAnalytics()
  }, [])

  const fetchInsights = async () => {
    setLoading(true)
    setInsights('')
    try {
      const res = await axios.post('/ai/insights')
      setInsights(res.data.insights)
    } catch (error) {
      toast.error('Failed to fetch AI insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-serif text-amber-400">
          Manager Dashboard
        </h1>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">
              Total Revenue
            </h3>
            <p className="text-4xl font-bold text-amber-400">
              ₹{analytics?.totalRevenue.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">
              Total Paid Orders
            </h3>
            <p className="text-4xl font-bold text-amber-400">
              {analytics?.totalOrders || 0}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">
              Avg Order Value
            </h3>
            <p className="text-4xl font-bold text-amber-400">
              ₹
              {analytics
                ? (
                    analytics.totalRevenue / (analytics.totalOrders || 1)
                  ).toFixed(2)
                : '0.00'}
            </p>
          </div>
        </div>

        {/* Top Items Chart */}
        {analytics?.topItems?.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-6 text-amber-400 font-serif">
              Top Selling Items
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topItems}>
                  <XAxis dataKey="name" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI Section */}
        <div className="bg-zinc-900 border border-amber-500/20 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-amber-400 font-serif">
            🤖 DineFlow AI Assistant
          </h2>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 text-black px-6 py-3 rounded-lg font-bold transition mb-4"
          >
            {loading
              ? '🧠 AI is thinking...'
              : 'Generate AI Operational Insights'}
          </button>

          {insights && (
            <div className="bg-black/50 border border-zinc-800 p-4 rounded-lg mt-4">
              <div className="prose prose-invert max-w-none text-gray-300">
                <ReactMarkdown>{insights}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
