// ==========================
// Booking Controller
// ==========================
const Booking = require("../models/Booking");

// ✅ Create new booking (auto-cancel after 10 minutes if unpaid)
const createBooking = async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      theaterName,
      showId,
      showDate,
      showTime,
      screen,
      selectedSeats,
      totalAmount,
      userId,
      userName,
      userEmail,
    } = req.body;

    if (
      !movieId ||
      !movieTitle ||
      !showDate ||
      !showTime ||
      !selectedSeats ||
      !totalAmount ||
      !userEmail
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    const newBooking = new Booking({
      movieId,
      movieTitle,
      theaterName,
      showId,
      showDate,
      showTime,
      screen,
      selectedSeats,
      totalAmount,
      userId,
      userName,
      userEmail,
      status: "pending",
      paymentStatus: "unpaid",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await newBooking.save();

    // ✅ Auto-cancel after 10 minutes if not paid
    setTimeout(async () => {
      try {
        const booking = await Booking.findById(newBooking._id);
        if (
          booking &&
          booking.paymentStatus === "unpaid" &&
          booking.status === "pending"
        ) {
          booking.status = "cancelled";
          await booking.save();

          // console.log(`⏰ Booking ${booking._id} auto-cancelled after 10 min`)

          // 🔁 Socket update
          const io = req.app.get("io");
          if (io) {
            const room = `${movieId}-${showDate}-${showTime}`;

            const allBookings = await Booking.find({
              movieId,
              showDate: new Date(showDate),
              showTime,
              status: { $ne: "cancelled" },
            });

            const reservedSeats = allBookings.flatMap((b) => b.selectedSeats);

            io.to(room).emit("reservedSeatsUpdate", {
              movieId,
              showDate,
              showTime,
              reservedSeats,
            });

            io.to(room).emit("bookingExpired", {
              bookingId: booking._id,
              message: "A booking has expired",
            });
          }
        }
      } catch (error) {
        console.error("Auto-cancel error:", error);
      }
    }, 10 * 60 * 1000);

    // ✅ Real-time seat update
    const io = req.app.get("io");
    if (io) {
      const room = `${movieId}-${showDate}-${showTime}`;
      const allBookings = await Booking.find({
        movieId,
        showDate: new Date(showDate),
        showTime,
        status: { $ne: "cancelled" },
      });
      const reservedSeats = allBookings.flatMap((b) => b.selectedSeats);
      io.to(room).emit("reservedSeatsUpdate", {
        movieId,
        showDate,
        showTime,
        reservedSeats,
      });
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get booking by ID
const bookingData = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    console.error("❌ Error fetching booking:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// refound 

const refundBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Prevent duplicate refund
    if (booking.paymentStatus === "refunded_request") {
      return res.status(400).json({ error: "Refund already processed" });
    }

    // Update statuses
    booking.status = "cancelled";
    booking.paymentStatus = "refunded_request";
    booking.refundDate = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      booking,
    });
  } catch (err) {
    console.error("❌ Error processing refund:", err);
    res.status(500).json({ error: "Server error while processing refund" });
  }
};

// refound update
const UpdateRefundBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body; // "refunded_confirm" | "refund_rejected"

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Prevent duplicate refund actions
    if (
      ["refunded_confirm", "refund_rejected"].includes(booking.paymentStatus)
    ) {
      return res.status(400).json({ error: "Refund already processed" });
    }

    // Update based on action
    if (paymentStatus === "refunded_confirm") {
      booking.status = "cancelled"; // mark booking cancelled
      booking.paymentStatus = "refunded_confirm"; // confirmed refund
      booking.refundDate = new Date();
    } else if (paymentStatus === "refund_rejected") {
      booking.paymentStatus = "refund_rejected"; // rejected refund
    } else {
      return res.status(400).json({ error: "Invalid paymentStatus" });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Refund ${
        paymentStatus === "refunded_confirm" ? "confirmed" : "rejected"
      } successfully`,
      booking,
    });
  } catch (err) {
    console.error("❌ Error updating refund:", err);
    res.status(500).json({ error: "Server error while updating refund" });
  }
};

// ✅ Get another booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    // console.log(booking)
    res.status(200).json(booking);
  } catch (err) {
    console.error("❌ Error fetching booking:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get user bookings by email
const getUserBookings = async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail)
      return res.status(400).json({ error: "userEmail is required" });

    const bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Error fetching user bookings:", err);
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
};

// ✅ Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Error fetching all bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// ✅ Get reserved seats for a movie show
const getReservedSeats = async (req, res) => {
  try {
    const { movieId, showDate, showTime } = req.query;
    if (!movieId || !showDate || !showTime) {
      return res
        .status(400)
        .json({ error: "movieId, showDate, and showTime are required" });
    }

    const bookings = await Booking.find({
      movieId,
      showDate: new Date(showDate),
      showTime,
      status: { $ne: "cancelled" },
    });

    const reservedSeats = bookings.flatMap((b) => b.selectedSeats);
    res.status(200).json({ reservedSeats });
  } catch (error) {
    console.error("❌ Error fetching reserved seats:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.paymentStatus = paymentStatus || booking.paymentStatus;
    booking.status = paymentStatus === "paid" ? "confirmed" : booking.status;
    if (transactionId) booking.transactionId = transactionId;

    await booking.save();

    // 🔁 Socket update
    const io = req.app.get("io");
    if (io) {
      const room = `${booking.movieId}-${
        booking.showDate.toISOString().split("T")[0]
      }-${booking.showTime}`;
      io.to(room).emit("paymentUpdated", {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
      });
    }

    res.status(200).json({ message: "Payment status updated", booking });
  } catch (error) {
    console.error("❌ Error updating payment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Check booking expiry manually
const checkBookingExpiry = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const now = new Date();
    const isExpired =
      booking.expiresAt < now && booking.paymentStatus === "unpaid";

    if (isExpired && booking.status === "pending") {
      booking.status = "cancelled";
      await booking.save();
      return res.status(200).json({ expired: true, booking });
    }

    res.status(200).json({ expired: false, booking });
  } catch (error) {
    console.error("❌ Error checking expiry:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get weekly booking summary
const getWeeklyBookings = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$showDate" },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyBookings = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    bookings.forEach((item) => {
      const dayIndex = item._id - 1;
      weeklyBookings[dayNames[dayIndex]] = item.totalBookings;
    });

    res.status(200).json(weeklyBookings);
  } catch (error) {
    console.error("❌ Error fetching weekly bookings:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    await Booking.findByIdAndDelete(id);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// Exports
// ==========================
module.exports = {
  createBooking,
  bookingData,
  getBookingById,
  getUserBookings,
  getAllBookings,
  getReservedSeats,
  updatePaymentStatus,
  checkBookingExpiry,
  getWeeklyBookings,
  deleteBooking,
  refundBooking,
  UpdateRefundBooking,
};
