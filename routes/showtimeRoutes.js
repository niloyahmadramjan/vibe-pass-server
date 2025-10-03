const express = require("express");
const router = express.Router();
const { addShowtime, getShowtimes, updateShowtime, deleteShowtime } = require("../controllers/showtimeController");

// Add a new showtime
router.post("/add", addShowtime);

// Get all showtimes
router.get("/", getShowtimes);
// updatate Showtime
router.put("/:id", updateShowtime);
// delete showtime
router.delete("/:id", deleteShowtime);

module.exports = router;
