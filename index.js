// =========================
//  Import Dependencies
// =========================
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const paymentRoute = require('./routes/paymentRoutes')


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

//  Write here your custom routers
// Example:
// const userRoutes = require('./routes/userRoutes')
// app.use('/api/users', userRoutes)

app.use('/auth', authRoutes)


// Only use your payment routes
app.use("/api/payments", paymentRoute);







// =========================
// 📌 Database + Server Start
// =========================
connectDB() // Connect to MongoDB

app.listen(port, () => {
  console.log(`🚀 Server is running at: http://localhost:${port}`)
})
