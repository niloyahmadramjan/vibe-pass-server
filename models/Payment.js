const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String }, 
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    provider: { type: String, default: "stripe" },
    transactionId: { type: String },
    sessionId: { type: String },
    sessionTitle: { type: String },
    providerPaymentId: String,
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
