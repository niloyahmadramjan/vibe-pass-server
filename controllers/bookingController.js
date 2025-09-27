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
      // Updated to match the new frontend data structure.
      // We now expect 'userId' and 'userName' and no longer 'userPhone'.
      userId,
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
      userId,
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




// Get all bookings for a user by email
const getUserBookings = async (req, res) => {
  try {
    // Get email from query params: ?email=sshapa17@gmail.com
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const bookings = await Booking.find({ userEmail });
   
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};




module.exports = { createBooking, bookingData, getUserBookings }
