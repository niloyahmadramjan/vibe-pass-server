const mongoose = require('mongoose')
const { Schema } = mongoose

const bookingSchema = new Schema(
  {
    // The unique identifier of the movie from the TMDB API.
    movieId: {
      type: String,
      required: true,
      trim: true,
    },
    // The title of the movie at the time of booking.
    movieTitle: {
      type: String,
      required: true,
      trim: true,
    },
    // The name of the theater where the movie is being shown.
    theaterName: {
      type: String,
      required: true,
      trim: true,
    },
    // The unique ID for the selected showtime.
    showId: {
      type: String,
      required: true,
      trim: true,
    },
    // The date of the show. Stored as a Date object for better querying.
    showDate: {
      type: Date,
      required: true,
    },
    // The time of the show.
    showTime: {
      type: String,
      required: true,
      trim: true,
    },
    // The screen number for the show.
    screen: {
      type: String,
      required: true,
      trim: true,
    },
    // An array of strings representing the selected seats (e.g., ["A1", "A2"]).
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
    // The total amount for the booking.
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // The unique user ID of the person making the booking.
    userId: {
      type: String,
     
      trim: true,
    },
    // The user's name.
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    // The user's email.
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    // The current status of the booking.
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    // The payment status of the booking.
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
  },
  {
    // Mongoose will automatically add `createdAt` and `updatedAt` timestamps.
    timestamps: true,
  }
)

// Create the model from the schema.
const Booking = mongoose.model('Booking', bookingSchema)

// Export the model for use in other files.
module.exports = Booking
