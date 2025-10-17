// ======================================================
// 🚀 VibePass Server Entry Point
// ======================================================

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

// 🛣️ Import Route Files
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const sslpaymentRoutes = require('./routes/sslpaymentRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const hallRoutes = require('./routes/hallRoutes')
const pdfRoutes = require('./routes/pdfRoutes')
const userRoutes = require('./routes/userRoutes')
const movieRoutes = require('./routes/movieRoutes')
const showtimeRoutes = require('./routes/showtimeRoutes')
const couponRoutes = require('./routes/couponRoutes')
const eventRoutes = require('./routes/eventRoutes')
const newsLetterRoutes = require('./routes/newsLetterRoutes')
const rewardRoutes = require('./routes/rewardRoutes')
const chatRoutes = require('./routes/chatRoutes')

// 🧠 Background Controllers
require('./controllers/reminderController')

// =========================
// ⚙️ App Configuration
// =========================
dotenv.config()
const app = express()
const port = process.env.PORT || 5000

// Create HTTP server (required for Socket.io)
const server = http.createServer(app)

// =========================
// 🧱 Middleware Setup
// =========================
app.use(
  cors({
    origin: [
      'https://vibe-pass-8z9z.onrender.com',
      'https://vibe-pass.vercel.app',
      'http://localhost:3000',
      'http://localhost:5000',
    ],
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// =========================
// ⚡ Socket.io Setup
// =========================
const io = new Server(server, {
  cors: {
    origin: [
      'https://vibe-pass-8z9z.onrender.com',
      'https://vibe-pass.vercel.app',
      'http://localhost:3000',
      'http://localhost:5000',
    ],
    credentials: true,
  },
})

// Make io globally accessible through app
app.set('io', io)

// =========================
// 🎬 Booking-Related Socket Logic
// =========================
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id)

  // 🏷️ Join a room specific to a movie + date + showtime
  socket.on('joinRoom', ({ movieId, showDate, showtime }) => {
    const room = `${movieId}-${showDate}-${showtime}`
    socket.join(room)
    console.log(`👉 ${socket.id} joined room: ${room}`)
  })

  // ❌ Handle user disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
  })
})

// =========================
// 💬 Real-Time Chat Socket
// =========================
require('./services/chatSocket')(io)

// =========================
// 🌐 Base Test Route
// =========================
app.get('/', (req, res) => {
  res.send('🚀 VibePass Server is running smoothly...')
})

// =========================
// 🧭 API Route Registration
// =========================

// 🔐 Authentication
app.use('/api/auth', authRoutes)

// 🎟️ Ticket Booking
app.use('/api/ticket', bookingRoutes)

// 💳 Payments
app.use('/api/payments', paymentRoutes)

// 💰 SSLCommerz Payments
app.use('/api/payments/sslcommerz', sslpaymentRoutes)

// 🧾 PDF Ticket Generation
app.use('/api/generate-ticket-pdf', pdfRoutes)

// 🏢 Hall Distribution
app.use('/api/hall-distribution', hallRoutes)

// 🎬 Movies
app.use('/api/movies', movieRoutes)

// ⏰ Showtimes
app.use('/api/showtime', showtimeRoutes)

// 🎉 Events
app.use('/api/events', eventRoutes)

// 📰 Newsletter
app.use('/api/newsletter', newsLetterRoutes)

// 🎟️ Coupons
app.use('/api/coupons', couponRoutes)

// 🏆 Rewards
app.use('/api/rewards', rewardRoutes)

// 👤 User Management
app.use('/api/user', userRoutes)

// 💬 Chat (Real-time Messaging)
app.use('/api/chat', chatRoutes)

// =========================
// 🗄️ Database + Server Startup
// =========================
connectDB()

server.listen(port, () => {
  console.log(`✅ Express server running at: http://localhost:${port}`)
  console.log('🔌 Socket.io ready for real-time connections')
})
