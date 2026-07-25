const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

// Create HTTP server and attach Socket.io
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow Next.js frontend
    methods: ['GET', 'POST'],
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

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/ai', require('./routes/aiRoutes'))
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/menu', require('./routes/menuRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'DineFlow AI API is healthy and running!' })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  // Changed app.listen to server.listen
  console.log(`🚀 Server running on port ${PORT}`)
})
