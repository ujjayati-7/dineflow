'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

export default function Home() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([]) // Cart state
  const [tableNumber] = useState(5) // Hardcoded for now (simulating QR scan)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('/menu')
        setMenuItems(res.data)
      } catch (error) {
        console.error('Failed to fetch menu', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  const addToCart = (item) => {
    const existingItem = cart.find((i) => i.menuItemId === item._id)
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ])
    }
    toast.success(`${item.name} added to cart`)
  }

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  const placeOrder = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to place an order')
      router.push('/login')
      return
    }

    try {
      const res = await axios.post('/orders', {
        tableNumber,
        items: cart.map(({ name, price, ...keep }) => keep), // Strip out name/price, backend handles it
      })
      toast.success('Order sent to the kitchen!')
      setCart([]) // Clear cart
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {' '}
      {/* Added padding bottom so cart doesn't cover menu */}
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          DineFlow Menu
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Table {tableNumber} • Scan, Order, Eat.
        </p>

        {loading ? (
          <p className="text-center">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className={`bg-white p-6 rounded-2xl shadow-sm border ${!item.isAvailable ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold">
                    ${item.price}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4">{item.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-400">
                    Prep: {item.prepTimeMins} mins
                  </span>

                  {item.isAvailable ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Add to Order
                    </button>
                  ) : (
                    <span className="text-red-500 text-sm font-semibold">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Floating Cart UI */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{cart.length} item(s) in cart</p>
              <p className="text-gray-500">
                Total:{' '}
                <span className="font-bold text-blue-600">
                  ${cartTotal.toFixed(2)}
                </span>
              </p>
            </div>
            <button
              onClick={placeOrder}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
