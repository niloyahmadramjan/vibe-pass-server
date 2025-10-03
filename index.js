// =========================
// 📦 Import Dependencies
// =========================
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

// Database + Routes
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const paymentRoute = require('./routes/paymentRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const hallRoutes = require('./routes/hallRoutes')
const pdfRoutes = require("./routes/pdfRoutes");
const userRoutes = require("./routes/userRoutes");

// =========================
// ⚙️ App Configuration
// =========================
dotenv.config()
const app = express()
const port = process.env.PORT || 5000

// =========================
// 🛠️ Middlewares
// =========================
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))
app.use(express.json())

// =========================
//  Routes
// =========================
app.get('/', (req, res) => {
  res.send('Vibepass server is running..')
})

app.use('/api/auth', authRoutes)

// 🎟️ Booking routes
app.use('/api/ticket', bookingRoutes)
app.use('/api/payments', paymentRoute)

// pdf use
app.use("/api/generate-ticket-pdf", pdfRoutes);


// Hall Distribution data 
app.use('/api/hall-distribution', hallRoutes)
// movie routes
app.use("/api/movies", movieRoutes);
// show time
app.use("/api/showtimes", showtimeRoutes);

// coupon routes
app.use("/api/coupons",couponRoutes )

// User data modify

app.use("/api/user", userRoutes)
app.use('/api/showtime', showtimeRoutes)

// =========================
// ✅ Socket.io Setup (Real-time Seat Booking)
// =========================
connectDB() // Connect to MongoDB


// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running at: http://localhost:${port}`)
})

