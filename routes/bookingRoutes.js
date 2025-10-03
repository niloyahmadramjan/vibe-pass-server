const express = require('express');
const router = express.Router();
const { createBooking, bookingData} = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken.js')

router.post('/booking', verifyToken, createBooking)
router.get('/booking/:id',verifyToken, bookingData)

module.exports = router;
