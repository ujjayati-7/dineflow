'use client'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

// Connect to the backend socket server
const socket = io('http://localhost:5000')

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/orders/active')
        setOrders(
          res.data.filter(
            (o) => o.status === 'received' || o.status === 'preparing',
          ),
        )
      } catch (error) {
        console.error('Failed to fetch orders', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()

    socket.on('newOrder', (order) => {
      toast.success(`🔔 New order for Table ${order.tableNumber}!`)
      setOrders((prev) => [...prev, order])
    })

    return () => {
      socket.off('newOrder')
    }
  }, [])

  const advanceStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'received' ? 'preparing' : 'ready'

    try {
      const res = await axios.put(`/orders/${orderId}/status`, {
        status: nextStatus,
      })

      if (nextStatus === 'ready') {
        setOrders(orders.filter((o) => o._id !== orderId))
        toast.success('Order marked as READY! Waiter notified.')
      } else {
        setOrders(orders.map((o) => (o._id === orderId ? res.data : o)))
      }
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8 font-serif text-amber-400">
        Kitchen Display System (KDS)
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading active orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-xl">
          No active orders. Kitchen is clear! 🧑‍🍳
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`p-6 rounded-2xl shadow-lg border-2 ${
                order.status === 'received'
                  ? 'bg-zinc-900 border-amber-500/50'
                  : 'bg-zinc-900 border-blue-500/50'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-amber-400">
                  Table {order.tableNumber}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'received'
                      ? 'bg-amber-500 text-black'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-6">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between border-b border-zinc-800 pb-2 text-gray-300"
                  >
                    <span className="font-semibold">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {order.specialInstructions && (
                <p className="text-red-400 text-sm mb-4 italic">
                  ⚠️ {order.specialInstructions}
                </p>
              )}

              <button
                onClick={() => advanceStatus(order._id, order.status)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-lg font-bold transition"
              >
                {order.status === 'received'
                  ? 'Start Preparing'
                  : 'Mark as Ready 🔔'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
