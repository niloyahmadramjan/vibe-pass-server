const Booking = require('../models/Booking')

const TOTAL_SEATS = 100 // আপনার hall এর total seats

const SHOWTIMES = [
  { id: 'showtime-1', time: '03:00 PM', price: 150 },
  { id: 'showtime-2', time: '06:00 PM', price: 200 },
  { id: 'showtime-3', time: '09:00 PM', price: 180 },
]

const getAvailableShowtimes = async (req, res) => {
  try {
    const { movieId, showDate } = req.query

    if (!movieId || !showDate) {
      return res.status(400).json({ error: 'movieId and showDate are required' })
    }

    const today = new Date().toISOString().split('T')[0]
    const currentHour = new Date().getHours()

    const showtimesWithAvailability = await Promise.all(
      SHOWTIMES.map(async (showtime) => {
        const bookings = await Booking.find({
          movieId,
          showDate: new Date(showDate),
          showTime: showtime.time,
          status: { $ne: 'cancelled' }
        })

        const bookedSeatsCount = bookings.reduce(
          (total, booking) => total + booking.selectedSeats.length, 0
        )

        const availableSeats = TOTAL_SEATS - bookedSeatsCount

        // Check if past show (for today only)
        let isPast = false
        if (showDate === today) {
          const [time, period] = showtime.time.split(' ')
          const [hour] = time.split(':').map(Number)
          let hour24 = hour
          if (period === 'PM' && hour !== 12) hour24 += 12
          else if (period === 'AM' && hour === 12) hour24 = 0
          if (hour24 <= currentHour) isPast = true
        }

        return {
          ...showtime,
          available: availableSeats,
          isAvailable: availableSeats > 0 && !isPast,
          isPast
        }
      })
    )

    const activeShowtimes = showtimesWithAvailability.filter(show => !show.isPast)

    res.status(200).json({ showtimes: activeShowtimes, totalSeats: TOTAL_SEATS })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deletePastBookings = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = await Booking.deleteMany({ showDate: { $lt: today } })
    res.status(200).json({ message: 'Deleted successfully', deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const autoCleanupPastBookings = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = await Booking.deleteMany({ showDate: { $lt: today } })
    if (result.deletedCount > 0) {
      console.log(`🗑️ Auto-cleanup: Deleted ${result.deletedCount} past bookings`)
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

module.exports = { getAvailableShowtimes, deletePastBookings, autoCleanupPastBookings }