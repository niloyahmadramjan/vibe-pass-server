const Booking = require('../models/Booking')

// ✅ Create new booking
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

    if (
      !movieId ||
      !movieTitle ||
      !showDate ||
      !showTime ||
      !selectedSeats ||
      !totalAmount ||
      !userEmail
    ) {
      return res
        .status(400)
        .json({ error: 'All required fields must be provided' })
    }

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
      status: 'pending',
      paymentStatus: 'unpaid',
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

// ✅ Get booking by ID (single route)
const bookingData = async (req, res) => {
  try {
    const { id } = req.params
    const booking = await Booking.findById(id)

    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    res.status(200).json(booking)
  } catch (err) {
    console.error('❌ Error fetching booking:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Another get booking by ID (if needed for /bookings/:id)
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params
    const booking = await Booking.findById(id)

    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    res.status(200).json(booking)
  } catch (err) {
    console.error('❌ Error fetching booking:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const { userEmail } = req.query
    if (!userEmail)
      return res.status(400).json({ error: 'userEmail is required' })

    const bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 })
    res.status(200).json(bookings)
  } catch (err) {
    console.error('❌ Error fetching user bookings:', err)
    res.status(500).json({ error: 'Failed to fetch user bookings' })
  }
}

// ✅ Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 })
    res.status(200).json(bookings)
  } catch (err) {
    console.error('❌ Error fetching all bookings:', err)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}

// ✅ Get reserved seats for a show
const getReservedSeats = async (req, res) => {
  try {
    const { showId } = req.query
    if (!showId) return res.status(400).json({ error: 'showId is required' })

    const bookings = await Booking.find({ showId })
    const reservedSeats = bookings.flatMap((b) => b.selectedSeats)

    res.json({ reservedSeats })
  } catch (err) {
    console.error('❌ Error fetching reserved seats:', err)
    res.status(500).json({ error: 'Failed to fetch reserved seats' })
  }
}

// ✅ Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus } = req.body

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    )

    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    res.json({ message: 'Payment status updated', booking })
  } catch (err) {
    console.error('❌ Error updating payment status:', err)
    res.status(500).json({ error: 'Failed to update payment status' })
  }
}

// Get weekly bookings (per day)
const getWeeklyBookings = async (req, res) => {
  try {
    // Aggregation: group bookings by day of week
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: '$showDate' }, // Sunday = 1, Monday = 2, ...
          totalBookings: { $sum: 1 },
        },
      },
    ])

    // Map day numbers to names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weeklyBookings = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    }

    bookings.forEach((item) => {
      const dayIndex = item._id - 1 // $dayOfWeek returns 1–7
      weeklyBookings[dayNames[dayIndex]] = item.totalBookings
    })

    res.status(200).json(weeklyBookings)
  } catch (error) {
    console.error(' Error fetching weekly bookings:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Check and update booking expiry
const checkBookingExpiry = async (req, res) => {
  try {
    const { id } = req.params
    const booking = await Booking.findById(id)

    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    const bookingTime = new Date(booking.createdAt)
    const now = new Date()
    const diffMinutes = (now - bookingTime) / 1000 / 60

    if (diffMinutes > 15 && booking.paymentStatus === 'unpaid') {
      booking.status = 'expired'
      await booking.save()
      return res.json({ message: 'Booking expired', booking })
    }

    res.json({ message: 'Booking is still valid', booking })
  } catch (err) {
    console.error('❌ Error checking booking expiry:', err)
    res.status(500).json({ error: 'Failed to check booking expiry' })
  }
}

// Delete booking by ID
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params

    // Check if booking exists
    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Delete booking
    await Booking.findByIdAndDelete(id)

    res.status(200).json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error(' Error deleting booking:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// const updateBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body; // e.g. { status: "confirmed" }

//     // Check if booking exists
//     const booking = await Booking.findById(id);
//     if (!booking) {
//       return res.status(404).json({ error: "Booking not found" });
//     }

//     // Update booking with new data
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true } // return updated document
//     );

//     res.status(200).json({
//       message: "Booking updated successfully",
//       booking: updatedBooking,
//     });
//   } catch (error) {
//     console.error("❌ Error updating booking:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

module.exports = {
  createBooking,
  bookingData,
  getBookingById,
  getUserBookings,
  getReservedSeats,
  updatePaymentStatus,
  checkBookingExpiry,
  getWeeklyBookings,
  getAllBookings,
  deleteBooking,
}
