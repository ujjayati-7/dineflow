'use client'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'

export default function WaiterDashboard() {
  const [readyOrders, setReadyOrders] = useState([])
  const [pendingPayments, setPendingPayments] = useState([])
  const [tables, setTables] = useState([])

  const fetchData = async () => {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        axios.get('/orders/active'),
        axios.get('/tables'),
      ])

      setReadyOrders(ordersRes.data.filter((o) => o.status === 'ready'))
      setPendingPayments(
        ordersRes.data.filter((o) => o.status === 'pending_payment'),
      )
      setTables(tablesRes.data)
    } catch (error) {
      console.error('Failed to fetch waiter data', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleServed = async (orderId) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: 'served' })
      toast.success('Order marked as Served!')
      fetchData()
    } catch (error) {
      toast.error('Failed to update order')
    }
  }

  const handleConfirmPayment = async (tableNumber) => {
    try {
      await axios.put(`/orders/table/${tableNumber}/confirm-payment`)
      toast.success(`Table ${tableNumber} payment confirmed!`)
      fetchData()
    } catch (error) {
      toast.error('Failed to confirm payment')
    }
  }

  const cycleTableStatus = async (table) => {
    const nextStatus =
      table.status === 'available'
        ? 'occupied'
        : table.status === 'occupied'
          ? 'cleaning'
          : 'available'
    try {
      await axios.put(`/tables/${table._id}`, { status: nextStatus })
      fetchData()
    } catch (error) {
      toast.error('Failed to update table')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8 font-serif text-amber-400">
        Waiter Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Payments Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400">
            💳 Pending Payments
          </h2>
          {pendingPayments.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-gray-500">
              No pending payments.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((order) => (
                <div
                  key={order._id}
                  className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-bold text-amber-400">
                      Table {order.tableNumber}
                    </h3>
                    <span className="text-sm uppercase font-bold bg-amber-500 text-black px-3 py-1 rounded-full">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleConfirmPayment(order.tableNumber)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Confirm Payment Received
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ready to Serve Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400">
            🔔 Ready to Serve
          </h2>
          {readyOrders.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-gray-500">
              No food waiting.
            </div>
          ) : (
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-zinc-900 border border-green-500/30 p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-green-400">
                      Table {order.tableNumber}
                    </h3>
                  </div>
                  <div className="mb-4">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="font-semibold text-gray-300">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() => handleServed(order._id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
                  >
                    Mark as Served
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table Management Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            🍽️ Floor Status
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {tables.map((table) => (
              <div
                key={table._id}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition hover:scale-105 ${
                  table.status === 'available'
                    ? 'bg-zinc-900 border-green-500/50'
                    : table.status === 'occupied'
                      ? 'bg-zinc-900 border-red-500/50'
                      : 'bg-zinc-900 border-amber-500/50'
                }`}
                onClick={() => cycleTableStatus(table)}
              >
                <h3 className="text-xl font-bold mb-2 text-white">
                  Table {table.tableNumber}
                </h3>
                <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
                  {table.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
