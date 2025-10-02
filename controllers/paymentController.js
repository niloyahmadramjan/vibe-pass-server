require('dotenv').config();

const Booking = require('../models/Booking');
const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent
const initiatePayment = async (req, res) => {
    try {
        // Store all incoming data from frontend
        const paymentData = { ...req.body };

        console.log("data:", paymentData);

        const { amount, bookingId, userId } = paymentData;



        // Create a Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // amount in cents
            currency: "usd",
            metadata: { bookingId, userId }, // attach bookingId and userId for reference
            automatic_payment_methods: { enabled: true },
        });

        // Create a Payment record in MongoDB
        const payment = await Payment.create({
            ...paymentData, // store any additional fields sent from frontend
            provider: "stripe",
            status: "pending", // default status
            providerPaymentId: paymentIntent.id, // store Stripe payment intent ID
        });

        // Respond with client secret and payment record
        res.json({
            clientSecret: paymentIntent.client_secret,
            payment,
        });
    } catch (err) {
        console.error("Payment initiation error:", err);
        res.status(500).json({ error: "Payment initiation failed" });
    }
};

// Confirm Payment (frontend has already confirmed payment)
const confirmPayment = async (req, res) => {
    try {
        const { transactionId, bookingId } = req.body;
        console.log(req.body)
        // Retrieve PaymentIntent from Stripe using transactionId
        const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

        // Check if payment was successful
        if (!paymentIntent || paymentIntent.status !== "succeeded") {
            return res.status(400).json({ error: "Payment not successful yet" });
        }

        // Update payment record in MongoDB
        let payment = await Payment.findOneAndUpdate(
            { providerPaymentId: transactionId },
            { status: "paid", updatedAt: new Date(), bookingId }, // set status to paid and attach bookingId
            { new: true }
        );

        // Handle case where payment record was not found
        if (!payment) {
            return res.status(404).json({ error: "Payment record not found" });
        }

        // If bookingId exists, update booking status
        if (bookingId) {
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { status: "confirmed", paymentStatus: "paid" }, // update booking status
                { new: true }
            );

            // Return success response with updated payment and booking
            return res.json({
                success: true,
                message: "Payment confirmed & booking updated",
                payment,
                booking: updatedBooking,
            });
        }

        // Return success response if no booking update is required
        res.json({ success: true, message: "Payment confirmed", payment });
    } catch (err) {
        console.error("Confirm payment error:", err);
        res.status(500).json({ error: "Could not confirm payment" });
    }
};


const getWeeklyRevenue = async (req, res) => {
    try {
        const payments = await Payment.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" }, // Day number: 1=Sunday, 2=Monday, ...
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const result = {
            Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
        };

        payments.forEach(item => {
            const dayName = weekDays[item._id - 1]; // fix offset
            if (dayName) {
                result[dayName] = item.total / 100; // convert cents to dollars if needed
            }
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

const getAllPaymnetData = async (req, res) => {

    try {
        const payment = await Payment.find({ status: "paid" });
        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch paymnet" });
    }
}




module.exports = { initiatePayment, confirmPayment, getWeeklyRevenue, getAllPaymnetData };