require('dotenv').config();

const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent
const initiatePayment = async (req, res) => {
    try {
        const { bookingId, amount, userId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount / 100, // store in dollars, not cents
            currency: "usd",
            metadata: { bookingId, userId },
            automatic_payment_methods: { enabled: true },
        });

        const payment = new Payment({
            bookingId,
            userId,
            amount,
            provider: "stripe",
            status: "pending",
            providerPaymentId: paymentIntent.id,
        });
        await payment.save();

        res.json({
            clientSecret: paymentIntent.client_secret,
            payment,
        });
    } catch (err) {
        console.error("Payment initiation error:", err);
        res.status(500).json({ error: "Payment initiation failed" });
    }
};

// Confirm Payment (frontend already confirmed)
const confirmPayment = async (req, res) => {
    try {
        const { transactionId, bookingId, sessionId, sessionTitle } = req.body;
       
        // Retrieve PaymentIntent from Stripe (no confirm!)
        const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

        if (!paymentIntent || paymentIntent.status !== "succeeded") {
            return res.status(400).json({ error: "Payment not successful yet" });
        }

        // Update existing payment record
        let payment = await Payment.findOneAndUpdate(
            { providerPaymentId: transactionId },
            { status: "paid", updatedAt: new Date() },
            { new: true }
        );

        // Create payment if not exists
        if (!payment) {
            payment = await Payment.create({
                bookingId,
                sessionId,
                sessionTitle,
                amount: paymentIntent.amount, // convert cents to USD
                userId: paymentIntent.metadata.userId || null,
                provider: "stripe",
                status: "paid",
                providerPaymentId: transactionId,
            });
        }

        res.json({ success: true, message: "Payment confirmed ✅", payment });
    } catch (err) {
        console.error("❌ Confirm payment error:", err);
        res.status(500).json({ error: "Could not confirm payment" });
    }
};






module.exports = { initiatePayment, confirmPayment };