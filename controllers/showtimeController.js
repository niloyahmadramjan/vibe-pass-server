const Booking = require('../models/Booking')

const TOTAL_SEATS = 100

// ✅ Fixed 3 Showtimes
const SHOWTIMES = [
  { id: 'showtime-1', time: '03:00 PM', price: 150 },
  { id: 'showtime-2', time: '06:00 PM', price: 200 },
  { id: 'showtime-3', time: '09:00 PM', price: 180 },
]



// ✅ Get Available Showtimes
const getAvailableShowtimes = async (req, res) => {
  try {
    const { movieId, showDate } = req.query

    if (!movieId || !showDate) {
      return res.status(400).json({ error: 'movieId and showDate are required' })
    }

    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const showtimesWithAvailability = await Promise.all(
      SHOWTIMES.map(async (showtime) => {
        // Count booked seats
        const bookings = await Booking.find({
          movieId,
          showDate: new Date(showDate),
          showTime: showtime.time,
          status: { $ne: 'cancelled' }
        })

        const bookedSeatsCount = bookings.reduce(
          (total, booking) => total + booking.selectedSeats.length, 
          0
        )

        const availableSeats = TOTAL_SEATS - bookedSeatsCount

        // Check if past show (only for today)
        let isPast = false
        if (showDate === today) {
          const [time, period] = showtime.time.split(' ')
          const [hour, minute] = time.split(':').map(Number)
          
          let hour24 = hour
          if (period === 'PM' && hour !== 12) hour24 += 12
          else if (period === 'AM' && hour === 12) hour24 = 0

          // Show হয়ে গেলে isPast = true
          if (currentHour > hour24 || (currentHour === hour24 && currentMinute >= minute)) {
            isPast = true
          }
        }

        return {
          ...showtime,
          available: availableSeats,
          isAvailable: availableSeats > 0 && !isPast,
          isPast
        }
      })
    )

    // শুধু active showtimes return করব
    const activeShowtimes = showtimesWithAvailability.filter(show => !show.isPast)

    res.status(200).json({ 
      showtimes: activeShowtimes, 
      totalSeats: TOTAL_SEATS 
    })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ✅ Delete Past Bookings
const deletePastBookings = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const result = await Booking.deleteMany({ 
      showDate: { $lt: today } 
    })
    
    res.status(200).json({ 
      message: 'Past bookings deleted', 
      deletedCount: result.deletedCount 
    })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ✅ Auto Cleanup Function (server start এ call হবে)
const autoCleanupPastBookings = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const result = await Booking.deleteMany({ 
      showDate: { $lt: today } 
    })
    
    if (result.deletedCount > 0) {
      // console.log(`🗑️ Cleanup: Deleted ${result.deletedCount} past bookings`)
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error)
  }
}

module.exports = { 
  getAvailableShowtimes, 
  deletePastBookings, 
  autoCleanupPastBookings 
}