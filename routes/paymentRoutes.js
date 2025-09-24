const express = require("express");
const { initiatePayment, confirmPayment } = require("../controllers/paymentController");
const router = express.Router();

// Create PaymentIntent
router.post("/", initiatePayment);

// Confirm payment manually from frontend
router.post("/confirm-payment", confirmPayment);

module.exports = router;



