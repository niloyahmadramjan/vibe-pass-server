// =========================
// 🎟️ Booking Routes
// =========================
const express = require('express')
const router = express.Router()

// =========================
// 📦 Import Controllers
// =========================
const {
  createBooking,
  bookingData,
  getBookingById,
  getUserBookings,
  getWeeklyBookings,
  getAllBookings,
  getReservedSeats,
  updatePaymentStatus,
  checkBookingExpiry,
  deleteBooking,
} = require('../controllers/bookingController')
const adminOnly = require('../middlewares/adminOnly');
const verifyToken = require("../middlewares/verifyToken")
// =========================
// 🧭 Route Definitions
// =========================

// 🆕 Create new booking
router.post('/booking', createBooking)

// 🔍 Get booking by ID
router.get('/booking/:id', bookingData)
router.get('/bookings/:id', getBookingById)

// ❌ Delete booking
router.delete('/:id', deleteBooking)

// 👤 Get bookings for logged-in user
router.get('/my-bookings', getUserBookings)

// 📊 Get weekly bookings stats
router.get('/weekly-bookings', verifyToken, adminOnly, getWeeklyBookings)

// 📜 Get all bookings
// router.get('/', verifyToken, adminOnly, getAllBookings)          //...............................
router.get('/', getAllBookings)          //...............................

// 💺 Get reserved seats for a specific movie + showtime
router.get('/reserved-seats', getReservedSeats)

// 💳 Update payment status
router.patch('/booking/:id/payment', updatePaymentStatus)

// ⏰ Check and update booking expiry
router.post('/booking/:id/expiry', checkBookingExpiry)

// =========================
// ✅ Export Router
// =========================
module.exports = router
