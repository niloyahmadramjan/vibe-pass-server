const express = require("express");
const router = express.Router();
const { sendShowtimeReminders } = require("../controllers/reminderController");

router.get("/", sendShowtimeReminders);

module.exports = router;
