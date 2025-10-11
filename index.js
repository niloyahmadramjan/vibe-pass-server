// =========================
// 📦 Import Dependencies
// =========================
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

// =========================
// 🧩 Import Custom Modules
// =========================
const connectDB = require('./config/db')

// 🛣️ Import Routes
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const hallRoutes = require('./routes/hallRoutes')
const pdfRoutes = require('./routes/pdfRoutes')
const userRoutes = require('./routes/userRoutes')
const movieRoutes = require('./routes/movieRoutes')
const showtimeRoutes = require('./routes/showtimeRoutes')
const couponRoutes = require('./routes/couponRoutes')
const events = require('./routes/eventRoutes')
const reminderRoutes = require("./routes/reminderRoutes")
// =========================
// ⚙️ App Configuration
// =========================
dotenv.config()
const app = express()
const port = process.env.PORT || 5000

// Create HTTP server for Socket.io
const server = http.createServer(app)

// =========================
// ⚡ Socket.io Setup
// =========================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Make io globally accessible
app.set('io', io)

// Handle Socket.io events
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id)

  // Join a specific movie + date + showtime room
  socket.on('joinRoom', ({ movieId, showDate, showtime }) => {
    const room = `${movieId}-${showDate}-${showtime}`
    socket.join(room)
    console.log(`👉 ${socket.id} joined room: ${room}`)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
  })
})

// =========================
// 🧱 Middleware
// =========================
app.use(cors())
app.use(express.json())

// =========================
// 🌐 Base Route
// =========================
app.get('/', (req, res) => {
  res.send('🚀 VibePass Server is running smoothly...')
})

// =========================
// 🧭 API Routes
// =========================

// Auth
app.use('/api/auth', authRoutes)

// Booking
app.use('/api/ticket', bookingRoutes)

// Payments
app.use('/api/payments', paymentRoutes)

// PDF Generation
app.use('/api/generate-ticket-pdf', pdfRoutes)

// Hall Distribution
app.use('/api/hall-distribution', hallRoutes)

// Movies
// app.use('/api/movies', movieRoutes)
app.use("/api/movies", movieRoutes);
// Showtimes
app.use('/api/showtime', showtimeRoutes)
// Events
app.use('/api/events',events)

// Coupons
app.use('/api/coupons', couponRoutes)

// User (CRUD Operations)
app.use('/api/user', userRoutes)

app.use("/api/reminders", reminderRoutes)

// =========================
// 🗄️ Database + Server Start
// =========================
connectDB()

server.listen(port, () => {
  console.log(`✅ Express server running at: http://localhost:${port}`)
  console.log('🔌 Socket.io ready for real-time connections')
})
