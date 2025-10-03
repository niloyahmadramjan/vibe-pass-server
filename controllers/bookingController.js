const Booking = require('../models/Booking')

// ✅ Create Booking with Real-time Socket Update
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
      userId,
      userName,
      userEmail,
    } = req.body

    // Validation
    if (!movieId || !movieTitle || !showDate || !showTime || !selectedSeats || !totalAmount || !userEmail) {
      return res.status(400).json({ error: 'All required fields must be provided' })
    }

    // Create new booking
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
      status: 'pending',
      paymentStatus: 'unpaid',
    })

    await newBooking.save()

    // ✅ Real-time Socket.io Update
    const io = req.app.get("io")
    const room = `${movieId}-${showTime}`
    
    // Get all reserved seats for this show
    const allBookings = await Booking.find({ 
      movieId, 
      showTime,
      status: { $ne: 'cancelled' } 
    })
    
    const reservedSeats = allBookings.flatMap(b => b.selectedSeats)

    // Broadcast updated reserved seats to all users in the room
    io.to(room).emit("reservedSeatsUpdate", { 
      movieId,
      showDate,
      showTime,
      reservedSeats 
    })

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    })
  } catch (error) {
    console.error('❌ Error creating booking:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ✅ Get Booking by ID
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

// ✅ Get Reserved Seats for a Movie + Showtime
// ✅ Get Reserved Seats - ADD showDate parameter
const getReservedSeats = async (req, res) => {
  try {
    const { movieId, showtime, showDate } = req.query // ✅ showDate added

    if (!movieId || !showtime || !showDate) {
      return res.status(400).json({ error: 'movieId, showDate, and showtime are required' })
    }

    const bookings = await Booking.find({
      movieId,
      showDate: new Date(showDate), // ✅ Date filter added
      showTime: showtime,
      status: { $ne: 'cancelled' }
    })

    const reservedSeats = bookings.flatMap(booking => booking.selectedSeats)

    res.status(200).json({ reservedSeats })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports = { createBooking, bookingData, getReservedSeats }