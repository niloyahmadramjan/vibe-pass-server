const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  movieTitle: {
    type: String,
    required: true,
    trim: true
  },
  theaterName: {
    type: String,
    required: true,
    trim: true
  },
  showTime: {
    type: String,
    required: true
  },
  selectedSeats: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  processedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: 'original'
  }
}, {
  timestamps: true
});

// Index for better query performance
refundSchema.index({ bookingId: 1 });
refundSchema.index({ userEmail: 1 });
refundSchema.index({ status: 1 });
refundSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Refund', refundSchema);