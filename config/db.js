// =========================
// 📌 config/db.js
// =========================
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // MongoDB connection
    await mongoose.connect(process.env.MONGO_URI)

    console.log('✅ MongoDB Connected Successfully')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message)
    process.exit(1) // Stop the server if DB connection fails
  }
}

// 👉 CommonJS export
module.exports = connectDB
