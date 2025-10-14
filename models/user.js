const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      required: function () {
        return this.provider === 'local'
      },
    },
    role: { type: String, default: 'user' },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'github'],
      default: 'local',
    },
    image: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    },

    // Extra Profile Info
    dob: { type: Date },
    state: { type: String },
    district: { type: String },
    pincode: { type: String },

    // Verification
    emailVerified: { type: Boolean, default: true },
    phoneVerified: { type: Boolean, default: true },

    // Preferences
    preferences: {
      notifications: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      language: { type: String, default: 'en' },
    },

    // Security
    pin: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

    // Support Messages (if needed)
    supportRequests: [
      {
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
