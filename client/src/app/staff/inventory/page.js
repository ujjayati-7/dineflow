'use client'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

export default function InventoryDashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [restockValues, setRestockValues] = useState({})

  const fetchItems = async () => {
    try {
      const res = await axios.get('/menu')
      setItems(res.data)
    } catch (error) {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleRestock = async (id, name) => {
    const amountToAdd = parseInt(restockValues[id]) || 0
    if (amountToAdd <= 0) {
      toast.error('Please enter a valid number to restock')
      return
    }

    const currentItem = items.find((i) => i._id === id)
    const newInventory = currentItem.dailyInventory + amountToAdd

    try {
      await axios.put(`/menu/${id}`, {
        dailyInventory: newInventory,
        isAvailable: true,
      })
      toast.success(
        `${name} restocked by ${amountToAdd}! Total: ${newInventory}`,
      )
      setRestockValues({ ...restockValues, [id]: '' })
      fetchItems()
    } catch (error) {
      toast.error('Failed to restock')
    }
  }

  const handleMarkSoldOut = async (id, name) => {
    try {
      await axios.put(`/menu/${id}`, { dailyInventory: 0, isAvailable: false })
      toast.success(`${name} marked as Sold Out`)
      fetchItems()
    } catch (error) {
      toast.error('Failed to update item')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8 font-serif text-amber-400">
        Inventory Management
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="p-4 text-amber-400">Item Name</th>
              <th className="p-4 text-amber-400">Price</th>
              <th className="p-4 text-center text-amber-400">Stock Left</th>
              <th className="p-4 text-right text-amber-400">
                Restock / Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id}
                className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${!item.isAvailable ? 'bg-red-900/10' : ''}`}
              >
                <td className="p-4 font-semibold text-white">{item.name}</td>
                <td className="p-4 text-amber-400">₹{item.price}</td>
                <td
                  className={`p-4 text-center font-bold ${item.dailyInventory < 5 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {item.dailyInventory}
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end items-center">
                    <input
                      type="number"
                      value={restockValues[item._id] || ''}
                      onChange={(e) =>
                        setRestockValues({
                          ...restockValues,
                          [item._id]: e.target.value,
                        })
                      }
                      placeholder="Qty"
                      className="w-20 p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-center focus:ring-2 focus:ring-amber-500 outline-none text-white"
                    />
                    <button
                      onClick={() => handleRestock(item._id, item.name)}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Restock
                    </button>
                    {item.isAvailable && (
                      <button
                        onClick={() => handleMarkSoldOut(item._id, item.name)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
