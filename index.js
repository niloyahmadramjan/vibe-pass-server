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
const userRoutes = require('./routes/userRoutes')
const movieRoutes = require('./routes/movieRoutes')
const showtimeRoutes = require("./routes/showtimeRoutes")
const couponRoutes = require("./routes/couponRoutes")
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
app.use('/api/hall-distribution', hallRoutes)
// movie routes
app.use("/api/movies", movieRoutes);
// show time
// app.use("/api/showtimes", showtimeRoutes);

// coupon routes
app.use("/api/coupons",couponRoutes )

// User data modify

app.use("/api/user", userRoutes)
app.use('/api/showtime', showtimeRoutes)

// =========================
// ✅ Socket.io Setup (Real-time Seat Booking)
// =========================
const server = http.createServer(app)
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  },
})

// Globally access io instance
app.set("io", io)

// Socket connection handler
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id)

  // Join a specific movie + date + showtime room
  socket.on("joinRoom", ({ movieId, showDate, showtime }) => {
    const room = `${movieId}-${showDate}-${showtime}`
    socket.join(room)
    console.log(`👉 ${socket.id} joined room: ${room}`)
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id)
  })
})


// =========================
// 🗄️ Database + Server Start
// =========================
connectDB()

server.listen(port, () => {
  console.log(`🚀 Server is running at: http://localhost:${port}`)
  console.log(`🔌 Socket.io ready for real-time connections`)
})