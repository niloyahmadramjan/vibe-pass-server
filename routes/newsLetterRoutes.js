const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address" });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already subscribed" });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    return res
      .status(200)
      .json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error, try again later" });
  }
});

module.exports = router;
