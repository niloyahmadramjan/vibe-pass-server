const express = require('express');
const router = express.Router();
const { createBooking, bookingData, getUserBookings} = require('../controllers/bookingController');

router.post('/booking', createBooking);
router.get('/booking/:id', bookingData)
// Get bookings for logged-in user
router.get('/my-bookings', getUserBookings);


module.exports = router;
