// routes/showtimeRoutes.js
const express = require("express")
const router = express.Router()
const { getAvailableShowtimes, deletePastBookings } = require("../controllers/showtimeController")

// ✅ Get available showtimes for a movie + date
router.get("/", getAvailableShowtimes)  // frontend call: /api/showtime?movieId=xxx&showDate=yyyy-mm-dd

// ✅ Delete past bookings manually (optional)
router.delete("/cleanup", deletePastBookings)

module.exports = router
