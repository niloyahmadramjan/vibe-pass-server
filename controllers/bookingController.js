const Booking = require('../models/Booking')

// ✅ Create Booking with 10 minutes auto-cancel
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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    })

    await newBooking.save()

    // ✅ Auto-cancel after 10 minutes if not paid
    setTimeout(async () => {
      try {
        const booking = await Booking.findById(newBooking._id)
        
        if (booking && booking.paymentStatus === 'unpaid' && booking.status === 'pending') {
          booking.status = 'cancelled'
          await booking.save()

          console.log(`⏰ Booking ${booking._id} auto-cancelled after 10 min`)

          // Socket update
          const io = req.app.get("io")
          if (io) {
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
        }
      } catch (error) {
        console.error('Auto-cancel error:', error)
      }
    }, 10 * 60 * 1000) // 10 minutes

    // ✅ Real-time Socket update
    const io = req.app.get("io")
    if (io) {
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
    }

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

const getReservedSeats = async (req, res) => {
  try {
    const { movieId, showDate, showTime } = req.query // ✅ Correct

    if (!movieId || !showDate || !showTime) {
      return res.status(400).json({ error: 'movieId, showDate, and showTime are required' })
    }

    console.log('📊 Query params:', { movieId, showDate, showTime }) // ✅ Add this for debugging

    const bookings = await Booking.find({
      movieId,
      showDate: new Date(showDate), // ✅ Convert to Date
      showTime,
      status: { $ne: 'cancelled' }
    })

    const reservedSeats = bookings.flatMap(b => b.selectedSeats)

    console.log('🎫 Reserved seats:', reservedSeats) // ✅ Add this for debugging

    res.status(200).json({ reservedSeats })
  } catch (error) {
    console.error('❌ Error fetching reserved seats:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Update Payment Status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus, transactionId } = req.body

    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    booking.paymentStatus = paymentStatus || booking.paymentStatus
    booking.status = paymentStatus === 'paid' ? 'confirmed' : booking.status
    if (transactionId) booking.transactionId = transactionId

    await booking.save()

    // Socket update
    const io = req.app.get("io")
    if (io) {
      const room = `${booking.movieId}-${booking.showDate.toISOString().split('T')[0]}-${booking.showTime}`
      
      io.to(room).emit("paymentUpdated", {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        status: booking.status
      })
    }

    res.status(200).json({ message: 'Payment status updated', booking })
  } catch (error) {
    console.error('❌ Error updating payment:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Check Booking Expiry
const checkBookingExpiry = async (req, res) => {
  try {
    const { id } = req.params
    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const now = new Date()
    const isExpired = booking.expiresAt < now && booking.paymentStatus === 'unpaid'

    if (isExpired && booking.status === 'pending') {
      booking.status = 'cancelled'
      await booking.save()

      const io = req.app.get("io")
      if (io) {
        const room = `${booking.movieId}-${booking.showDate.toISOString().split('T')[0]}-${booking.showTime}`
        
        const allBookings = await Booking.find({
          movieId: booking.movieId,
          showDate: booking.showDate,
          showTime: booking.showTime,
          status: { $ne: 'cancelled' }
        })
        
        const reservedSeats = allBookings.flatMap(b => b.selectedSeats)

        io.to(room).emit("reservedSeatsUpdate", {
          movieId: booking.movieId,
          showDate: booking.showDate.toISOString().split('T')[0],
          showTime: booking.showTime,
          reservedSeats
        })
      }

      return res.status(200).json({ expired: true, booking })
    }

    res.status(200).json({ expired: false, booking })
  } catch (error) {
    console.error('❌ Error checking expiry:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Get User Bookings
const getUserBookings = async (req, res) => {
  try {
    const userEmail = req.query.email
    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 })
   
    res.status(200).json(bookings)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Get All Bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 })
    res.status(200).json(bookings)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Get Weekly Bookings
const getWeeklyBookings = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$showDate" },
          totalBookings: { $sum: 1 }
        }
      }
    ])

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weeklyBookings = {
      Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
    }

    bookings.forEach(item => {
      const dayIndex = item._id - 1
      weeklyBookings[dayNames[dayIndex]] = item.totalBookings
    })

    res.status(200).json(weeklyBookings)
  } catch (error) {
    console.error("❌ Error fetching weekly bookings:", error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = { 
  createBooking, 
  bookingData, 
  getUserBookings, 
  getWeeklyBookings,
  getAllBookings,
  getReservedSeats,
  updatePaymentStatus,
  checkBookingExpiry
}