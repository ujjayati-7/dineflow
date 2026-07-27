'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'
import { ShoppingBag, Receipt, Sparkles } from 'lucide-react'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || '1'

  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [recommendation, setRecommendation] = useState('')
  const [loadingRec, setLoadingRec] = useState(false)
  const [isStaff, setIsStaff] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks']

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && JSON.parse(storedUser).role !== 'customer') {
      setIsStaff(true)
    }

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsStaff(false)
    toast.success('Logged out successfully')
    router.push('/login')
  }

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
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  const placeOrder = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to place an order')
      router.push('/login')
      return
    }
    try {
      await axios.post('/orders', {
        tableNumber,
        items: cart.map(({ name, price, ...keep }) => keep),
      })
      toast.success('Order sent to the kitchen!')
      setCart([])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    }
  }

  const getRecommendation = async () => {
    setLoadingRec(true)
    try {
      const res = await axios.post('/ai/recommend')
      setRecommendation(res.data.recommendation)
      toast.success('AI found something for you!')
    } catch (error) {
      toast.error('Failed to get recommendation')
    } finally {
      setLoadingRec(false)
    }
  }

  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  return (
    <div className="min-h-screen bg-black pb-32">
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-black/80 border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-400 tracking-tight font-serif">
              The DineFlow Bistro
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Table {tableNumber} • Scan, Order, Eat.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {isStaff && (
              <button
                onClick={() => router.push('/staff')}
                className="text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
              >
                Staff Portal
              </button>
            )}

            <button
              onClick={() => router.push(`/track?table=${tableNumber}`)}
              className="text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
            >
              🍔 My Order
            </button>

            <button
              onClick={() => router.push(`/bill?table=${tableNumber}`)}
              className="text-black bg-amber-500 hover:bg-amber-400 transition flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
            >
              <Receipt size={16} /> View Bill
            </button>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition text-sm font-semibold px-4 py-2 rounded-full border border-zinc-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="mb-10 bg-gradient-to-r from-amber-500/10 to-amber-500/0 border border-amber-500/20 p-[2px] rounded-2xl shadow-lg">
          <div className="bg-zinc-900 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={20} className="text-amber-400" />
              <h3 className="font-bold text-white">AI Food Curator</h3>
            </div>
            {recommendation ? (
              <p className="text-gray-300 font-medium text-sm leading-relaxed">
                {recommendation}
              </p>
            ) : (
              <button
                onClick={getRecommendation}
                disabled={loadingRec}
                className="text-amber-400 font-bold hover:underline disabled:text-gray-500 text-sm"
              >
                {loadingRec
                  ? '🤖 Thinking...'
                  : '✨ Get Personalized Recommendation'}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-900 text-gray-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 font-serif">
          Our Menu
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`bg-zinc-900 rounded-3xl shadow-sm border border-zinc-800 overflow-hidden transition-all hover:border-amber-500/50 ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full font-bold text-amber-400 shadow-md text-sm border border-amber-500/30">
                    ₹{item.price}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {item.name}
                    </h3>
                    <span className="text-xs font-medium text-gray-500 bg-zinc-800 px-2 py-1 rounded-md">
                      {item.prepTimeMins} mins
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    {item.description}
                  </p>
                  {item.isAvailable ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-amber-500 text-black py-3 rounded-xl font-semibold hover:bg-amber-400 transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={18} /> Add to Order
                    </button>
                  ) : (
                    <div className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-bold text-center text-sm border border-red-500/20">
                      Sold Out
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-zinc-900 border-t border-amber-500/20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] p-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative bg-amber-500/10 p-3 rounded-full">
                <ShoppingBag className="text-amber-400" size={24} />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              </div>
              <div>
                <p className="font-bold text-amber-400">
                  ₹{cartTotal.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Table {tableNumber}</p>
              </div>
            </div>
            <button
              onClick={placeOrder}
              className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition shadow-lg"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap in Suspense to fix Vercel build error with useSearchParams
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-amber-400">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
