'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, UtensilsCrossed, BarChart3, Package } from 'lucide-react'

export default function StaffPortal() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/login')
    }
  }, [router])

  if (!user)
    return (
      <div className="min-h-screen bg-black text-amber-400 flex items-center justify-center">
        Loading...
      </div>
    )

  const portals = [
    {
      name: 'Kitchen Display',
      href: '/staff/kitchen',
      icon: ChefHat,
      roles: ['chef', 'manager'],
    },
    {
      name: 'Waiter Dashboard',
      href: '/staff/waiter',
      icon: UtensilsCrossed,
      roles: ['waiter', 'manager'],
    },
    {
      name: 'Inventory Mgmt',
      href: '/staff/inventory',
      icon: Package,
      roles: ['manager'],
    },
    {
      name: 'Manager Analytics',
      href: '/staff/manager',
      icon: BarChart3,
      roles: ['manager'],
    },
  ]

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white font-serif">
              Staff Portal
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back,{' '}
              <span className="font-bold text-amber-400">{user.name}</span> (
              {user.role})
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/50 px-4 py-2 rounded-lg text-sm transition"
          >
            View Customer Menu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => {
            if (!portal.roles.includes(user.role)) return null

            const Icon = portal.icon
            return (
              <button
                key={portal.name}
                onClick={() => router.push(portal.href)}
                className="bg-zinc-900 hover:bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-8 rounded-2xl shadow-lg transition flex items-center gap-6 text-left group"
              >
                <div className="bg-amber-500/10 p-4 rounded-xl group-hover:bg-amber-500 transition border border-amber-500/20">
                  <Icon
                    size={32}
                    className="text-amber-400 group-hover:text-black transition"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {portal.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Click to open dashboard
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
