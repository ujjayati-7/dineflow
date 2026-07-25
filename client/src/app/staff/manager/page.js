'use client'
import { useState } from 'react'
import axios from '@/lib/axios'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

export default function ManagerDashboard() {
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
        <p className="text-gray-400 mb-8">AI-Powered Operational Insights</p>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">🤖 DineFlow AI Assistant</h2>
          <p className="text-gray-400 mb-4">
            Click the button below to let the AI analyze your live inventory and
            sales data for smart recommendations.
          </p>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            {loading ? '🧠 AI is thinking...' : 'Generate AI Insights'}
          </button>
        </div>

        {insights && (
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-blue-400">
              AI Recommendations:
            </h3>
            <div className="prose prose-invert max-w-none text-gray-200">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
