const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Amount is required and must be greater than 0",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: "usd", // or "bdt"
      metadata: { integration_check: "accept_a_payment" },
    });

    res.json({ clientSecret: paymentIntent.client_secret, success: true });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
      details: error.message,
    });
  }
});

// Save Payment (Dummy for now)
router.post("/save-payment", async (req, res) => {
  try {
    console.log("💾 Payment Saved:", req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save payment" });
  }
});

module.exports = router;
