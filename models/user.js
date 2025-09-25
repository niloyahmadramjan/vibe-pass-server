const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    provider: { type: String },
    image: { type: String },
  },
  { timestamps: true }
)

module.exports = mongoose.model('users', userSchema)
