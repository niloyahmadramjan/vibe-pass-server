const express = require('express')
const router = express.Router()
const { 
  getAvailableShowtimes,
  deletePastBookings
} = require('../controllers/showtimeController')

// Get available showtimes with real seat count
router.get('/available-showtimes', getAvailableShowtimes)

// Manually trigger cleanup of past bookings (admin only)
router.delete('/cleanup-past-bookings', deletePastBookings)

module.exports = router