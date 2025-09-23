const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String }, // শুধুমাত্র email/pass signup এ আসবে
    password: { type: String }, // local signup এর জন্য
    provider: { type: String }, // যেমন: "credentials", "google", "github"
    image: { type: String }, // provider login করলে avatar রাখার জন্য
  },
  { timestamps: true }
)

module.exports = mongoose.model('users', userSchema)
