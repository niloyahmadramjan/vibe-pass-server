const express = require('express')
const router = express.Router()
const { createBooking, bookingData, getReservedSeats } = require('../controllers/bookingController')

// Create new booking
router.post('/booking', createBooking)

// Get booking by ID
router.get('/booking/:id', bookingData)

// Get reserved seats for a specific movie + showtime
router.get('/reserved-seats', getReservedSeats)

module.exports = router