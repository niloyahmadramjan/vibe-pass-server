const express = require("express");
const router = express.Router();
const {
  createBooking,
  bookingData,
  getBookingById,
  getUserBookings,
  getWeeklyBookings,
  getAllBookings,
  getReservedSeats,
  checkBookingExpiry,
  deleteBooking,
  refundBooking,
  UpdateRefundBooking,
} = require("../controllers/bookingController");
const verifyToken = require("../middlewares/verifyToken");
const adminOnly = require("../middlewares/adminOnly");

router.post("/booking", createBooking);
router.get("/booking/:id", bookingData);
router.get("/bookings/:id", getBookingById);

// save refound_request data in booking data
router.post("/:id/refund", refundBooking);
//  refound update status
router.patch("/:id/refund", UpdateRefundBooking);

router.delete("/:id", deleteBooking);
router.get("/my-bookings", getUserBookings);
router.get("/weekly-bookings", verifyToken, adminOnly, getWeeklyBookings);
router.get("/", verifyToken, getAllBookings);
router.get("/reserved-seats", getReservedSeats);
router.post("/booking/:id/expiry", checkBookingExpiry);

// =========================
// ✅ Export Router
// =========================
module.exports = router;
