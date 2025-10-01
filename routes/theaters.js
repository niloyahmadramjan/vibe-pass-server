const express = require("express");
const Theater = require("../models/Theater.js");

const router = express.Router();

// GET /api/theaters/nearby?lat=23.81&lng=90.41&radius=5000
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing coordinates" });

    const meters = radius ? parseFloat(radius) : 5000;

    const theaters = await Theater.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distanceMeters",
          maxDistance: meters,
          spherical: true,
        },
      },
      { $sort: { distanceMeters: 1 } },
    ]);

    res.json({ theaters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
