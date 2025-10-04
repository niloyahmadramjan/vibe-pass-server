// =========================
// Import Dependencies
// =========================
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

// =========================
//  Import Custom Modules
// =========================
const connectDB = require('./config/db')

//  Routes
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const hallRoutes = require('./routes/hallRoutes')
const pdfRoutes = require('./routes/pdfRoutes')
const userRoutes = require('./routes/userRoutes')
const movieRoutes = require('./routes/movieRoutes')
const showtimeRoutes = require('./routes/showtimeRoutes')
const couponRoutes = require('./routes/couponRoutes')

// =========================
//  App Configuration
// =========================
dotenv.config()
const app = express()
const port = process.env.PORT || 5000

// =========================
//  Middlewares
// =========================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)

app.use(express.json())

// =========================
// 🌐 Base Route
// =========================
app.get('/', (req, res) => {
  res.send(' VibePass Server is running smoothly...')
})

// =========================
//  API Routes
// =========================

//  Auth
app.use('/api/auth', authRoutes)

//  Booking
app.use('/api/ticket', bookingRoutes)

//  Payments
app.use('/api/payments', paymentRoutes)

//  PDF Generation
app.use('/api/generate-ticket-pdf', pdfRoutes)

//  Hall Distribution
app.use('/api/hall-distribution', hallRoutes)

//  Movies
app.use('/api/movies', movieRoutes)

//  Showtimes
app.use('/api/showtime', showtimeRoutes)

//  Coupons
app.use('/api/coupons', couponRoutes)

//  User (CRUD Operations)
app.use('/api/user', userRoutes)

// =========================
//  Database Connection
// =========================
connectDB()

// =========================
//  Start Server
// =========================
app.listen(port, () => {
  console.log(`✅ Server is running at: http://localhost:${port}`)
})
