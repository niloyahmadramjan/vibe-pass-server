
// =========================
// 📦 Import Dependencies
// =========================
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Database + Routes
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const paymentRoute = require('./routes/paymentRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const hallRoutes = require('./routes/hallRoutes')
const movieRoutes = require("./routes/movieRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const couponRoutes = require("./routes/couponRoutes")
// =========================
// ⚙️ App Configuration
// =========================
dotenv.config() // Load environment variables from .env file
const app = express()
const port = process.env.PORT || 3000

// =========================
// 🛠️ Middlewares
// =========================
app.use(cors()) // Enable CORS for cross-origin requests
app.use(express.json()) // Parse incoming JSON requests (application/json)

// =========================
// 🚏 Routes
// =========================

// ✅ Default route (health check)
app.get('/', (req, res) => {
  res.send('Vibepass server is running..')
})

// 🔑 Authentication routes
app.use('/api/auth', authRoutes)

// 🎟️ Booking routes
app.use('/api/ticket', bookingRoutes)

// 💳 Payment routes
app.use('/api/payments', paymentRoute)

// Hall Distribution data 
app.use('/api/hall-distribution', hallRoutes)
// movie routes
app.use("/api/movies", movieRoutes);
// show time
app.use("/api/showtimes", showtimeRoutes);

// coupon routes
app.use("/api/coupons",couponRoutes )
// =========================
// 📌 Database + Server Start
// =========================
connectDB() // Connect to MongoDB


app.listen(port, () => {
  console.log(`🚀 Server is running at: http://localhost:${port}`)
})

