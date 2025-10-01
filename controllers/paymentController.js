require('dotenv').config();

const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent
const initiatePayment = async (req, res) => {
    try {
        // ফ্রন্টএন্ড থেকে আসা সব ডাটা ধরে রাখছি
        const paymentData = { ...req.body };

        const { amount, bookingId, userId } = paymentData;

        // Stripe PaymentIntent তৈরি করা
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // cents
            currency: "usd",
            metadata: { bookingId, userId },
            automatic_payment_methods: { enabled: true },
        });

        // MongoDB তে Payment record তৈরি
        const payment = await Payment.create({
            ...paymentData,              // ক্লায়েন্ট থেকে যেকোনো ফিল্ড
            provider: "stripe",
            status: "pending",
            providerPaymentId: paymentIntent.id,
        });

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
        // ক্লায়েন্ট থেকে আসা সব ডাটা ধরে রাখছি
        const paymentData = { ...req.body };

        const { transactionId, amount } = paymentData;

        console.log(paymentData)

        // Stripe থেকে PaymentIntent রিট্রিভ করা
        const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

        if (!paymentIntent || paymentIntent.status !== "succeeded") {
            return res.status(400).json({ error: "Payment not successful yet" });
        }

        // Payment DB আপডেট করা (ডাইনামিক ডাটা দিয়ে)
        let payment = await Payment.findOneAndUpdate(
            { providerPaymentId: transactionId },
            {
                ...paymentData,         
                status: "paid",
                updatedAt: new Date(),
            },
            { new: true }
        );

        // যদি payment না থাকে, তাহলে নতুন ক্রিয়েট
        if (!payment) {
            payment = await Payment.create({
                ...paymentData,
                status: "paid",
                provider: "stripe",
                providerPaymentId: transactionId,
            });
        }

        res.json({ success: true, message: "Payment confirmed ", payment });
    } catch (err) {
        console.error("❌ Confirm payment error:", err);
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

const getAllPaymnetData =async ( req,res)=>{

   try {
        const payment = await Payment.find();
        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch paymnet" });
    }
}




module.exports = { initiatePayment, confirmPayment, getWeeklyRevenue, getAllPaymnetData };