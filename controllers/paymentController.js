require("dotenv").config();
const Payment = require("../models/Payment");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Initiate Payment
const initiatePayment = async (req, res) => {
  try {
    const paymentData = { ...req.body };
    const { amount, bookingId, userId } = paymentData;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { bookingId, userId },
      automatic_payment_methods: { enabled: true },
    });

    const payment = await Payment.create({
      ...paymentData,
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

// ✅ Confirm Payment + Send Email
const confirmPayment = async (req, res) => {
  try {
    const paymentData = { ...req.body };
    const {
      transactionId,
      userEmail,
      userName,
      sessionTitle,
      amount,
      theaterName,
      showTime,
      selectedSeats,
      screen,
    } = paymentData;

    // 1. Stripe Payment যাচাই
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not successful yet" });
    }

    // 2. DB Update
    let payment = await Payment.findOneAndUpdate(
      { providerPaymentId: transactionId },
      { ...paymentData, status: "paid", updatedAt: new Date() },
      { new: true }
    );

    if (!payment) {
      payment = await Payment.create({
        ...paymentData,
        status: "paid",
        provider: "stripe",
        providerPaymentId: transactionId,
      });
    }

    // 3. Email পাঠানো
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #cc2027; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🎟️ VibePass</h1>
          <p style="margin: 0;">Payment Confirmation</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px; color: #333;">
          <h2>Hi ${userName},</h2>
          <p>✅ Your payment for <b>${sessionTitle}</b> was successful!</p>

          <!-- Ticket Info Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Transaction ID</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Amount Paid</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">৳${amount / 100}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Theater</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${theaterName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Show Time</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${showTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Screen</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${screen}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Seats</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${Array.isArray(selectedSeats) ? selectedSeats.join(", ") : selectedSeats}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">🎬 Enjoy your show with <b>VibePass</b>!</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 14px; color: #777;">
          © ${new Date().getFullYear()} VibePass. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"VibePass" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🎉 Payment Successful - VibePass",
      html: htmlTemplate,
    });

    res.json({
      success: true,
      message: "Payment confirmed & email sent",
      payment,
    });
  } catch (err) {
    console.error("❌ Confirm payment error:", err);
    res.status(500).json({ error: "Could not confirm payment" });
  }
};


// ✅ Get Payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { initiatePayment, confirmPayment, getPaymentById };
