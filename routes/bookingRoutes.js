const express = require('express');
const router = express.Router();
const { createBooking, bookingData} = require('../controllers/bookingController');

router.post('/booking', createBooking);
router.get('/booking/:id', bookingData)

module.exports = router;
