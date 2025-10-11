const mongoose = require('mongoose')
const { Schema } = mongoose

const bookingSchema = new Schema(
  {
    movieId: {
      type: String,
      required: true,
      trim: true,
    },
    movieTitle: {
      type: String,
      required: true,
      trim: true,
    },
    theaterName: {
      type: String,
      required: true,
      trim: true,
    },
    showId: {
      type: String,
      required: true,
      trim: true,
    },
    showDate: {
      type: Date,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
      trim: true,
    },
    screen: {
      type: String,
      required: true,
      trim: true,
    },
    selectedSeats: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0
        },
        message: 'At least one seat must be selected!',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: String,

      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired', 'checked_in'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded', 'partial'],
      default: 'unpaid',
    },
    // ✅ ADD THESE 2 NEW FIELDS BELOW
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
bookingSchema.index({ movieId: 1, showTime: 1, status: 1 })
// ✅ ADD THIS NEW INDEX
bookingSchema.index({ expiresAt: 1, paymentStatus: 1 })

const Booking = mongoose.model('Booking', bookingSchema)

// Export the model for use in other files.
module.exports = Booking