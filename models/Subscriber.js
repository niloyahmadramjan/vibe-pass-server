const mongoose = require('mongoose')

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    ip: { type: String },
    city: { type: String },
    region: { type: String },
    country: { type: String },
    postal: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String },
    org: { type: String },
  },
  { timestamps: true }
)

const Subscriber = mongoose.model('Subscriber', subscriberSchema)

module.exports = Subscriber
