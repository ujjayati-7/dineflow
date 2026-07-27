const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const passport = require('passport')
const connectDB = require('./config/db')

// Load environment variables
dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

// Allowed Origins for CORS (Localhost + Live Vercel URL)
const allowedOrigins = [
  'http://localhost:3000',
  'https://dineflow-mu.vercel.app', // <--- REPLACE WITH YOUR ACTUAL VERCEL URL
]

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT'],
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(passport.initialize())

// Create HTTP server and attach Socket.io
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT'],
  },
})

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('🟢 A user connected (Staff Dashboard)')

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected')
  })
})

// Make io accessible to our controllers
app.set('io', io)

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/menu', require('./routes/menuRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/tables', require('./routes/tableRoutes'))
app.use('/api/ai', require('./routes/aiRoutes'))

// Basic Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'DineFlow AI API is healthy and running!' })
})

// Start Server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
