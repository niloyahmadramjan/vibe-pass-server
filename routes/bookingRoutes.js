const express = require('express');
const router = express.Router();
const { createBooking, bookingData, getUserBookings, getWeeklyBookings, getAllBookings} = require('../controllers/bookingController');

router.post('/booking', createBooking);
router.get('/booking/:id', bookingData)
// Get bookings for logged-in user
router.get('/my-bookings', getUserBookings);
router.get("/weekly-bookings", getWeeklyBookings);
router.get("/",getAllBookings)


module.exports = router;
