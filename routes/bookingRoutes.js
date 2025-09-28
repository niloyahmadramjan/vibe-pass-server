const express = require('express');
const router = express.Router();
const { createBooking, bookingData, getBookingById} = require('../controllers/bookingController');

router.post('/booking', createBooking);
router.get('/booking/:id', bookingData)
router.get("/bookings/:id", getBookingById);

module.exports = router;
