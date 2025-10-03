const Booking = require('../models/Booking')


// This is an example of a backend controller function for creating a booking.
// It should be used in a Node.js/Express environment with Mongoose for database interaction.

const createBooking = async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      theaterName,
      showId,
      showDate,
      showTime,
      screen,
      selectedSeats,
      totalAmount,
      userName,
      userEmail,
    } = req.body

    // Basic validation to ensure required fields are present
    if (
      !movieId ||
      !movieTitle ||
      !showDate ||
      !showTime ||
      !selectedSeats ||
      !totalAmount ||
      !userEmail
    ) {
      return res.status(400).json({ error: 'All required fields must be provided' })
    }

    // Create a new booking instance using the data from the request body.
    // The 'userId' and 'userName' are now correctly passed to the new object.
    const newBooking = new Booking({
      movieId,
      movieTitle,
      theaterName,
      showId,
      showDate,
      showTime,
      screen,
      selectedSeats,
      totalAmount,
      userName,
      userEmail,
      status: 'pending', // default
      paymentStatus: 'unpaid', // default
    })

    await newBooking.save()

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    })
  } catch (error) {
    console.error('❌ Error creating booking:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}






// Get booking by ID
const bookingData = async (req, res) => {
  try {
    const { id } = req.params

    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    res.status(200).json(booking)
  } catch (error) {
    console.error('❌ Error fetching booking:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createBooking, bookingData }
