const Booking = require("../models/Booking");

// ✅ Create new booking
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
    });

    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get booking by ID (single route)
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

// ✅ Another get booking by ID (if needed for /bookings/:id)
const getBookingById = async (req, res) => {
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

// ✅ Get reserved seats for a show
const getReservedSeats = async (req, res) => {
  try {
    const { showId } = req.query;
    if (!showId) return res.status(400).json({ error: "showId is required" });

    const bookings = await Booking.find({ showId });
    const reservedSeats = bookings.flatMap((b) => b.selectedSeats);

    res.json({ reservedSeats });
  } catch (err) {
    console.error("❌ Error fetching reserved seats:", err);
    res.status(500).json({ error: "Failed to fetch reserved seats" });
  }
};

// ✅ Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json({ message: "Payment status updated", booking });
  } catch (err) {
    console.error("❌ Error updating payment status:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};

// ✅ Check and update booking expiry
const checkBookingExpiry = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const bookingTime = new Date(booking.createdAt);
    const now = new Date();
    const diffMinutes = (now - bookingTime) / 1000 / 60;

    if (diffMinutes > 15 && booking.paymentStatus === "unpaid") {
      booking.status = "expired";
      await booking.save();
      return res.json({ message: "Booking expired", booking });
    }

    res.json({ message: "Booking is still valid", booking });
  } catch (err) {
    console.error("❌ Error checking booking expiry:", err);
    res.status(500).json({ error: "Failed to check booking expiry" });
  }
};

module.exports = {
  createBooking,
  bookingData,
  getBookingById,
  getReservedSeats,
  updatePaymentStatus,
  checkBookingExpiry,
};
