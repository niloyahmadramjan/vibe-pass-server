// =========================
// 📦 Import Dependencies
// =========================
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const connectDB = require('./config/db')

// 🛣️ Import Routes
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
const events = require('./routes/eventRoutes')
const newsLetterRoutes = require('./routes/newsLetterRoutes')
const rewardRoutes = require('./routes/rewardRoutes')
const chatRoutes = require('./routes/chatRoutes')
const verifyqr = require('./routes/verify.qr.routes')

// Background controllers
require('./controllers/reminderController')
require('./controllers/movieScheduler')

// =========================
// ⚙️ App Configuration
// =========================
dotenv.config()
const app = express()
const port = process.env.PORT || 5000

// Create HTTP server for Socket.io
const server = http.createServer(app)

// =========================
// 🧱 Middleware
// =========================
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// =========================
// 🎬 Booking-related Socket Logic
// =========================
io.on('connection', (socket) => {
  // Join a specific movie + date + showtime room
  socket.on('joinRoom', ({ movieId, showDate, showtime }) => {
    const room = `${movieId}-${showDate}-${showtime}`
    socket.join(room)
  })

  socket.on('disconnect', () => {
    // console.log('❌ User disconnected:', socket.id);
  })
})

// =========================
// 💬 Chat Socket Integration
// =========================
require('./services/chatSocket')(io)

// =========================
// 🌐 Base Route
// =========================
app.get('/', (req, res) => {
  res.send('🚀 VibePass Server is running smoothly...')
})

// =========================
// 🧭 API Routes
// =========================
app.use('/api/auth', authRoutes)
app.use('/api/ticket', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/payments/sslcommerz', sslpaymentRoutes)
app.use('/api/generate-ticket-pdf', pdfRoutes)
app.use('/api/hall-distribution', hallRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/showtime', showtimeRoutes)
app.use('/api/events', events)
app.use('/api/newsletter', newsLetterRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/rewards', rewardRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/verify-qr', verifyqr)

// =========================
// 🗄️ Database + Server Start
// =========================
connectDB()

server.listen(port, () => {
  console.log(`✅ Express server running at: http://localhost:${port}`)
  console.log('🔌 Socket.io ready for real-time connections')
})
