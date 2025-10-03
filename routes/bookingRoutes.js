const express = require('express');
const router = express.Router();
const { createBooking, bookingData, getUserBookings, getWeeklyBookings, getAllBookings} = require('../controllers/bookingController');

// Create new booking
router.post('/booking', createBooking)

// Get booking by ID
router.get('/booking/:id', bookingData)
// Get bookings for logged-in user
router.get('/my-bookings', getUserBookings);
router.get("/weekly-bookings", getWeeklyBookings);
router.get("/",getAllBookings)


// Get reserved seats for a specific movie + showtime
router.get('/reserved-seats', getReservedSeats)
// Update payment status
router.patch('/booking/:id/payment', updatePaymentStatus)
// Check and update booking expiry
router.post('/booking/:id/expiry', checkBookingExpiry)

module.exports = router