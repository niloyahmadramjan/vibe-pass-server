const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  try {
    const { movieId, movieTitle, selectedSeats, showtime, totalAmount } = req.body;

    const newBooking = new Booking({
      movieId,
      movieTitle,
      selectedSeats,
      showtime,
      totalAmount,
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking saved successfully', booking: newBooking });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
