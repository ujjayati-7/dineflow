const mongoose = require('mongoose')
const dotenv = require('dotenv')
const MenuItem = require('./models/MenuItem')
const Table = require('./models/Table')
const User = require('./models/User')
const bcrypt = require('bcryptjs')

dotenv.config()

const seedItems = [
  {
    name: 'Margherita Pizza',
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop',
    description: 'Fresh basil, mozzarella, tomato sauce',
    price: 499,
    prepTimeMins: 20,
    dailyInventory: 15,
    category: 'Mains',
  },
  {
    name: 'Truffle Burger',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    description: 'Wagyu beef with truffle mayo',
    price: 699,
    prepTimeMins: 15,
    dailyInventory: 8,
    category: 'Mains',
  },
  {
    name: 'Paneer Tikka',
    image:
      'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop',
    description: 'Marinated cottage cheese grilled to perfection',
    price: 350,
    prepTimeMins: 10,
    dailyInventory: 20,
    category: 'Starters',
  },
  {
    name: 'Tomato Soup',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop',
    description: 'Creamy tomato basil soup',
    price: 199,
    prepTimeMins: 5,
    dailyInventory: 3,
    category: 'Starters',
  },
  {
    name: 'Chocolate Lava Cake',
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
    description: 'Warm cake with a molten center',
    price: 249,
    prepTimeMins: 12,
    dailyInventory: 5,
    category: 'Desserts',
  },
]

const seedTables = [
  { tableNumber: 1, capacity: 2, status: 'available' },
  { tableNumber: 2, capacity: 4, status: 'occupied' },
  { tableNumber: 3, capacity: 4, status: 'available' },
  { tableNumber: 4, capacity: 6, status: 'cleaning' },
  { tableNumber: 5, capacity: 2, status: 'occupied' },
]

const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('password123', salt)

  return [
    {
      name: 'Alex Manager',
      email: 'manager@dineflow.com',
      password: hashedPassword,
      role: 'manager',
    },
    {
      name: 'Chef Ratatouille',
      email: 'chef@dineflow.com',
      password: hashedPassword,
      role: 'chef',
    },
    {
      name: 'John Waiter',
      email: 'waiter@dineflow.com',
      password: hashedPassword,
      role: 'waiter',
    },
  ]
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB. Seeding...')

    await MenuItem.deleteMany()
    await MenuItem.insertMany(seedItems)

    await Table.deleteMany()
    await Table.insertMany(seedTables)

    await User.deleteMany({
      email: {
        $in: [
          'manager@dineflow.com',
          'chef@dineflow.com',
          'waiter@dineflow.com',
        ],
      },
    })
    const users = await seedUsers()
    await User.insertMany(users)

    console.log('✅ Menu, Tables, and Staff Accounts seeded successfully!')
    console.log(
      '👉 Staff Login: manager@dineflow.com / chef@dineflow.com / waiter@dineflow.com',
    )
    console.log('👉 Password for all staff: password123')
    process.exit()
  })
  .catch((err) => console.log(err))
