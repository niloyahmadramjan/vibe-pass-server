// =========================
//  Import Dependencies
// =========================
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const paymentRoute = require('./routes/paymentRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const http = require("http")
const { Server } = require("socket.io")

// =========================
//  App Configuration
// =========================
dotenv.config() // Load environment variables from .env file
const app = express()
const port = process.env.PORT || 3000

// =========================
//  Middlewares
// =========================
app.use(cors()) // Enable CORS for cross-origin requests
app.use(express.json()) // Parse incoming JSON requests

// =========================
//  Routes
// =========================
app.get('/', (req, res) => {
  res.send('Vibepass server is running..')
})

app.use('/auth', authRoutes)
app.use('/api', bookingRoutes)
app.use("/api/payments", paymentRoute)

// =========================
//  Socket.io Setup
// =========================
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*" },
})
app.set("io", io) // Globally access io instance

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id)

  // Join a room for live seat updates
  socket.on("joinRoom", ({ room }) => {
    socket.join(room)
    console.log(`👉 ${socket.id} joined ${room}`)
  })

  // Listen for seat booking updates from client
  socket.on("bookSeats", (bookedSeats) => {
    console.log("Seats booked:", bookedSeats)
    // Broadcast to all clients in the room
    io.emit("updateSeats", bookedSeats)
  })

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id)
  })
})

// =========================
//  Database + Server Start
// =========================
connectDB() // Connect to MongoDB

server.listen(port, () => {
  console.log(`🚀 Server is running at: http://localhost:${port}`)
})
