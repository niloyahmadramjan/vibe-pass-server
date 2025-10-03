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
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)

    })

await newBooking.save()

// ✅ ADD THIS ENTIRE BLOCK
setTimeout(async () => {
  try {
    const booking = await Booking.findById(newBooking._id)
    
    if (booking && booking.paymentStatus === 'unpaid' && booking.status === 'pending') {
      booking.status = 'cancelled'
      await booking.save()

      console.log(`⏰ Booking ${booking._id} auto-cancelled after 10 min`)

      const io = req.app.get("io")
      const room = `${movieId}-${showDate}-${showTime}`
      
      const allBookings = await Booking.find({ 
        movieId, 
        showDate: new Date(showDate),
        showTime,
        status: { $ne: 'cancelled' } 
      })
      
      const reservedSeats = allBookings.flatMap(b => b.selectedSeats)

      io.to(room).emit("reservedSeatsUpdate", { 
        movieId,
        showDate,
        showTime,
        reservedSeats 
      })

      io.to(room).emit("bookingExpired", {
        bookingId: booking._id,
        message: "A booking has expired"
      })
    }
  } catch (error) {
    console.error('Auto-cancel error:', error)
  }
}, 10 * 60 * 1000) // 10 minutes

// ✅ Real-time Socket.io Update (existing code continues here)
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







// ✅ ADD THESE 2 NEW FUNCTIONS

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus, transactionId } = req.body

    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking has been cancelled' })
    }

    if (new Date() > booking.expiresAt && booking.paymentStatus === 'unpaid') {
      booking.status = 'cancelled'
      await booking.save()
      return res.status(400).json({ error: 'Booking has expired' })
    }

    booking.paymentStatus = paymentStatus
    if (paymentStatus === 'paid') {
      booking.status = 'confirmed'
      booking.transactionId = transactionId
    }

    await booking.save()

    res.status(200).json({
      message: 'Payment updated successfully',
      booking
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const checkBookingExpiry = async (req, res) => {
  try {
    const { id } = req.params

    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const now = new Date()
    const isExpired = now > booking.expiresAt && booking.paymentStatus === 'unpaid'

    if (isExpired && booking.status !== 'cancelled') {
      booking.status = 'cancelled'
      await booking.save()
    }

    const timeRemaining = Math.max(0, Math.floor((booking.expiresAt - now) / 1000))

    res.status(200).json({
      booking,
      isExpired,
      timeRemaining
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}



module.exports = { createBooking, bookingData, getReservedSeats, updatePaymentStatus, checkBookingExpiry }