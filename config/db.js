const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')

dotenv.config()
const url = process.env.MONGO_URI;
const client = new MongoClient(url)

async function connectDB() {
  try {
    await client.connect()
    console.log('✅ MongoDB connected successfully')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  }
}

module.exports = { connectDB, client }
