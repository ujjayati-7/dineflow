'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from '@/lib/axios'
import { CheckCircle, ChefHat, ShoppingBag, Bell } from 'lucide-react'

export default function TrackOrder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || '1'

  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchActiveOrder = async () => {
      try {
        // We fetch the bill, but filter for orders that are NOT paid
        const res = await axios.get(`/orders/table/${tableNumber}`)
        if (!isMounted) return

        // Find the most recent order that is still being prepared
        const active = res.data.orders.find((o) =>
          ['received', 'preparing', 'ready', 'served'].includes(o.status),
        )
        setActiveOrder(active)
      } catch (error) {
        console.error('Failed to fetch order status')
      } finally {
        setLoading(false)
      }
    }

    fetchActiveOrder()
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchActiveOrder, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [tableNumber])

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-amber-400">
        Loading...
      </div>
    )

  // Define the steps
  const steps = [
    { key: 'received', label: 'Order Received', icon: ShoppingBag },
    { key: 'preparing', label: 'Preparing Food', icon: ChefHat },
    { key: 'ready', label: 'Ready to Serve', icon: Bell },
    { key: 'served', label: 'Served. Enjoy!', icon: CheckCircle },
  ]

  // Find which step we are currently on
  const currentStepIndex = activeOrder
    ? steps.findIndex((step) => step.key === activeOrder.status)
    : -1

  return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-black border-b border-amber-500/20 p-6 text-center">
          <h1 className="text-2xl font-bold text-amber-400 font-serif tracking-wide">
            Order Status
          </h1>
          <p className="text-gray-500 text-sm mt-1">Table {tableNumber}</p>
        </div>

        <div className="p-8">
          {!activeOrder ? (
            <div className="text-center py-10">
              <h2 className="text-xl font-bold text-white mb-2">
                No Active Orders 🍽️
              </h2>
              <p className="text-gray-500 mb-6">
                Place an order from the menu to see live updates here!
              </p>
              <button
                onClick={() => router.push(`/?table=${tableNumber}`)}
                className="bg-amber-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-400 transition"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <div>
              {/* Order Items Summary */}
              <div className="mb-8 p-4 bg-black/50 rounded-xl border border-zinc-800">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Your Order:
                </h3>
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-gray-300 py-1"
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Tracker */}
              <div className="space-y-6">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const Icon = step.icon

                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full border-2 transition-all ${
                          isCompleted
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : isCurrent
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400 scale-110'
                              : 'bg-zinc-800 border-zinc-700 text-gray-600'
                        }`}
                      >
                        <Icon
                          size={24}
                          className={isCurrent ? 'animate-pulse' : ''}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-bold transition ${isCurrent ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-amber-400">
                            In progress...
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
