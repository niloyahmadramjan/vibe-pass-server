const express = require('express')
const cors = require('cors')

const { connectDB } = require('./config/db')
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
connectDB()

// Routes

app.get('/', (req, res) => {
  res.send('✅ vibepass server is running')
})

// write here your routers 

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})
