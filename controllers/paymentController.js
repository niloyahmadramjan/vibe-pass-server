require('dotenv').config()
const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const Stripe = require('stripe')
const nodemailer = require('nodemailer')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const {updateBookingSignature} = require("../utils/updateBookingSignature")

// ✅ Initiate Payment
const initiatePayment = async (req, res) => {
  try {
    const paymentData = { ...req.body }
    const { amount, bookingId, userId } = paymentData

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { bookingId, userId },
      automatic_payment_methods: { enabled: true },
    })

    const payment = await Payment.create({
      ...paymentData,
      provider: 'stripe',
      status: 'pending',
      providerPaymentId: paymentIntent.id,
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      payment,
    })
  } catch (err) {
    console.error('Payment initiation error:', err)
    res.status(500).json({ error: 'Payment initiation failed' })
  }
}

// ✅ Confirm Payment + Send Email
const confirmPayment = async (req, res) => {
  try {
    const paymentData = { ...req.body }
    const {
      transactionId,
      userEmail,
      userName,
      sessionTitle,
      amount,
      theaterName,
      bookingId,
      showTime,
      selectedSeats,
      screen,
    } = paymentData

    // 1. Stripe Payment Verification
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId)
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful yet' })
    }

    // 2. Find and update payment
    let payment = await Payment.findOneAndUpdate(
      { providerPaymentId: transactionId },
      {
        ...paymentData,
        status: 'paid',
        updatedAt: new Date(),
        transactionId: transactionId, // Ensure transactionId is saved
      },
      { new: true }
    )

    // 3. Update booking status - ONLY ONCE
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: transactionId,
      },
      { new: true }
    )
    // After payment confirmation and booking update:
const qrSignature = await updateBookingSignature(bookingId, transactionId)

// You can include this in the email or response if needed
console.log('QR Signature generated:', qrSignature)

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    // 4. If payment record doesn't exist, create it
    if (!payment) {
      payment = await Payment.create({
        ...paymentData,
        status: 'paid',
        provider: 'stripe',
        providerPaymentId: transactionId,
        transactionId: transactionId,
      })
    }

    // 5. Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
    const htmlTemplate = `
    <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f4f6f9;
              margin: 0;
              padding: 20px;
            }
            .ticket {
              max-width: 750px;
              margin: auto;
              background: #fff;
              border-radius: 16px;
              box-shadow: 0 8px 30px rgba(0,0,0,0.1);
              overflow: hidden;
              border: 2px solid #CC2027;
            }
            .header {
              background: #CC2027;
              color: #fff;
              text-align: center;
              padding: 20px 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .section {
              padding: 20px 30px;
              border-bottom: 1px solid #eee;
            }
            .section h2 {
              margin: 0 0 15px;
              font-size: 18px;
              color: #CC2027;
              border-left: 4px solid #CC2027;
              padding-left: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              width: 160px;
              text-align: left;
              padding: 8px;
              color: #555;
              font-weight: 600;
              background: #fafafa;
              border-bottom: 1px solid #eee;
            }
            td {
              padding: 8px;
              font-size: 14px;
              color: #333;
              border-bottom: 1px solid #eee;
            }
            .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: bold;
              color: #fff;
            }
            .qr {
              text-align: center;
              padding: 25px;
            }
            .qr img {
              border: 6px solid #f4f4f4;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .qr p {
              margin-top: 10px;
              font-size: 13px;
              color: #444;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              padding: 15px 20px;
              background: #fafafa;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>🎟️ VibePass Ticket</h1>
              <p>Present this ticket at the theater entrance</p>
            </div>

            <div class="section">
              <h2>Show Information</h2>
              <table>
                <tr><th>Movie</th><td>${sessionTitle}</td></tr>
                <tr><th>Theater</th><td>${theaterName}</td></tr>
                <tr><th>Screen</th><td>${screen || 'N/A'}</td></tr>
                
                <tr><th>Time</th><td>${showTime}</td></tr>
                <tr><th>Seats</th><td>${selectedSeats.join(', ')}</td></tr>
              </table>
            </div>

            <div class="section">
              <h2>Booking Information</h2>
              <table>
                <tr><th>Name</th><td>${userName || 'N/A'}</td></tr>
                <tr><th>Email</th><td>${userEmail}</td></tr>
                <tr><th>Transaction ID</th><td>${transactionId}</td></tr>
                <tr><th>Status</th><td>Paid</td></tr>
                <tr><th>Total Paid</th><td style="font-weight:bold; color:#CC2027;">৳${amount}</td></tr>
              </table>
            </div>
            <div class="footer">
              ⚠️ Please arrive at least 30 minutes before showtime.<br/>
              Bring a valid ID matching the booking name.
            </div>
          </div>
        </body>
      </html>`

    await transporter.sendMail({
      from: `"VibePass" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Payment Successful - VibePass',
      html: htmlTemplate,
    })

    res.json({
      success: true,
      message: 'Payment confirmed & email sent',
      payment,
    })
  } catch (err) {
    console.error('❌ Confirm payment error:', err)
    res.status(500).json({ error: 'Could not confirm payment' })
  }
}

// ✅ Get Payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ✅ Get All Payments
const getAllPaymentData = async (req, res) => {
  try {
    const payments = await Payment.find()
    res.json(payments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getWeeklyRevenue = async (req, res) => {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6)

    const payments = await Payment.find({
      status: 'paid',
      updatedAt: { $gte: oneWeekAgo },
    })

    // Initialize 7 days with 0 revenue
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: 0,
      }
    })

    // Group payments by day
    payments.forEach((p) => {
      const dayName = new Date(p.updatedAt).toLocaleDateString('en-US', {
        weekday: 'short',
      })
      const day = days.find((d) => d.name === dayName)
      if (day) day.revenue += p.amount
    })

    res.json(days)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ✅ Get Payments by User Email
const getPaymentsByEmail = async (req, res) => {
  try {
    const { userEmail } = req.query // Change to userEmail

    if (!userEmail) {
      return res
        .status(400)
        .json({ error: 'Email query parameter is required' })
    }

    const payments = await Payment.find({ userEmail: userEmail }).sort({
      createdAt: -1,
    })

    if (!payments.length) {
      return res
        .status(404)
        .json({ message: 'No payments found for this email' })
    }

    res.json(payments)
  } catch (err) {
    console.error('❌ Get payments by email error:', err)
    res.status(500).json({ error: 'Failed to fetch payments' })
  }
}

module.exports = {
  initiatePayment,
  confirmPayment,
  getPaymentById,
  getAllPaymentData,
  getWeeklyRevenue,
  getPaymentsByEmail,
}
