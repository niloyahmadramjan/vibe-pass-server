const mongoose = require("mongoose");

const TheaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
});

TheaterSchema.index({ location: "2dsphere" });

module.exports = mongoose.models.Theater || mongoose.model("Theater", TheaterSchema);
