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
          return v && v.length > 0;
        },
        message: "At least one seat must be selected!",
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
      enum: ["pending", "confirmed", "cancelled", "expired", "checked_in"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "paid",
        "failed",
        "refunded_request",
        "refunded_confirm",
        "refund_rejected",
        'refunded',
        "partial",
      ],
      default: "unpaid",
    },
    qrSignature: {
      type: String,
      default: null,
    },
    lastQRUpdate: { 
      type: Date 
    },
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
    },
    reminderSentOneHour: { 
      type: Boolean, 
      default: false 
    },
    
    // ✅ REFUND-RELATED FIELDS ADDED BELOW
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'cancelled', 'processed'],
      default: 'none'
    },
    refundRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Refund'
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundProcessedAt: {
      type: Date
    },
    refundReason: {
      type: String,
      trim: true
    },
    adminRefundNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
bookingSchema.index({ movieId: 1, showTime: 1, status: 1 })
bookingSchema.index({ expiresAt: 1, paymentStatus: 1 })
// ✅ ADD REFUND-RELATED INDEXES
bookingSchema.index({ refundStatus: 1 })
bookingSchema.index({ userEmail: 1, refundStatus: 1 })
bookingSchema.index({ paymentStatus: 1, refundStatus: 1 })

// ✅ ADD VIRTUAL FOR REFUND ELIGIBILITY
bookingSchema.virtual('isRefundable').get(function() {
  const now = new Date();
  const showDateTime = new Date(this.showDate);
  const showTime = this.showTime;
  
  // Parse show time (assuming format like "02:30 PM")
  const [time, modifier] = showTime ? showTime.split(' ') : ['', ''];
let [hours, minutes] = time ? time.split(':') : ['00', '00'];
  
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  showDateTime.setHours(hours, minutes, 0, 0);
  
  // Refund allowed if show is more than 1 hour away
  const oneHourBefore = new Date(showDateTime.getTime() - (60 * 60 * 1000));
  
  return (
    this.paymentStatus === 'paid' &&
    this.status === 'confirmed' &&
    this.refundStatus === 'none' &&
    now < oneHourBefore
  );
});

// ✅ ADD METHOD TO CHECK REFUND STATUS
bookingSchema.methods.canRequestRefund = function() {
  return (
    this.paymentStatus === 'paid' &&
    this.status === 'confirmed' &&
    this.refundStatus === 'none' &&
    this.isRefundable
  );
};

// ✅ ADD METHOD TO INITIATE REFUND REQUEST
bookingSchema.methods.initiateRefundRequest = function(reason) {
  if (!this.canRequestRefund()) {
    throw new Error('Booking is not eligible for refund');
  }
  
  this.refundStatus = 'requested';
  this.refundReason = reason;
  return this.save();
};

// ✅ ADD METHOD TO PROCESS REFUND
bookingSchema.methods.processRefund = function(amount, adminNotes = '') {
  this.refundStatus = 'processed';
  this.refundAmount = amount || this.totalAmount;
  this.refundProcessedAt = new Date();
  this.adminRefundNotes = adminNotes;
  this.paymentStatus = 'refunded_confirm';
  this.status = 'cancelled';
  return this.save();
};

// ✅ ADD METHOD TO REJECT REFUND
bookingSchema.methods.rejectRefund = function(adminNotes = '') {
  this.refundStatus = 'rejected';
  this.adminRefundNotes = adminNotes;
  this.paymentStatus = 'refund_rejected';
  return this.save();
};

// ✅ ADD METHOD TO APPROVE REFUND
bookingSchema.methods.approveRefund = function(adminNotes = '') {
  this.refundStatus = 'approved';
  this.adminRefundNotes = adminNotes;
  return this.save();
};

// ✅ ADD METHOD TO CANCEL REFUND REQUEST
bookingSchema.methods.cancelRefundRequest = function() {
  this.refundStatus = 'cancelled';
  this.refundReason = '';
  return this.save();
};

// ✅ ENSURE VIRTUAL FIELDS ARE INCLUDED IN JSON OUTPUT
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema)

// Export the model for use in other files.
module.exports = Booking