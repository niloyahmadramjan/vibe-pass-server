const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  totalRedeemed: { type: Number, default: 0 },
  lastDailyClaim: Date,
  lastWeeklyClaim: Date,
  lastMonthlyClaim: Date,
  redeemedHistory: [
    {
      points: Number,
      amount: Number,
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Reward", rewardSchema);
