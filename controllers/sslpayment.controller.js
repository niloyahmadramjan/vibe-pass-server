const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const { updateBookingSignature } = require('../utils/updateBookingSignature')

// Initiate SSLCommerz Payment
const initiatePayment = async (req, res) => {
  try {
    const {
      transactionId,
      amount,
      status,
      bookingId,
      sessionTitle,
      userEmail,
      userName,
    } = req.body

    // ✅ Validate required fields
    if (!amount || !userName || !userEmail || !bookingId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // ✅ Generate unique transaction ID for SSLCommerz
    const tran_uuid = uuidv4()
    const tran_id = `SSL-${tran_uuid}`

    // ✅ Payment configuration for SSLCommerz
    const data = {
      store_id: process.env.STORE_ID,
      store_passwd: process.env.STORE_PASS,
      total_amount: parseFloat(amount),
      currency: 'BDT',
      tran_id,

      success_url: `${process.env.REDIRECT_URL}/success`,
      fail_url: `${process.env.REDIRECT_URL}/fail`,
      cancel_url: `${process.env.REDIRECT_URL}/cancel`,
      ipn_url: `${process.env.REDIRECT_URL}/ipn`,

      product_name: sessionTitle || 'Movie Ticket',
      product_category: 'Entertainment',
      product_profile: 'general',
      shipping_method: 'NO',

      cus_name: userName,
      cus_email: userEmail,
      cus_add1: '123 Street',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',

      // Optional metadata for tracking
      value_a: bookingId,
      value_b: userEmail,
    }

    // ✅ Call SSLCommerz API
    const response = await axios({
      method: 'POST',
      url: process.env.SSLCOMMERZ_API_URL,
      data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const gatewayURL = response.data?.GatewayPageURL

    // ✅ Store payment record in MongoDB
    await Payment.create({
      bookingId,
      amount,
      currency: 'BDT',
      provider: 'sslcommerz',
      transactionId: tran_id,
      sessionTitle: sessionTitle || 'Movie Ticket',
      userEmail,
      status: 'pending',
    })

    if (gatewayURL) {
      return res.status(200).json({ url: gatewayURL })
    } else {
      return res.status(500).json({
        error: 'Failed to retrieve GatewayPageURL',
        response: response.data,
      })
    }
  } catch (error) {
    console.error(
      'Payment initiation error:',
      error.response?.data || error.message
    )
    return res.status(500).json({
      error: 'Payment initiation failed',
      details: error.message,
    })
  }
}

// ✅ Handle Payment Success
const paymentSuccess = async (req, res) => {
  try {
    const paymentInfo = req.body

    if (paymentInfo.status === 'VALID') {
      // ✅ Get bookingId from paymentInfo (value_a) which we set during initiation
      const bookingId = paymentInfo.value_a
      const transactionId = paymentInfo.tran_id

      const updatedPayment = await Payment.findOneAndUpdate(
        { transactionId: paymentInfo.tran_id },
        {
          $set: {
            status: 'paid',
            providerPaymentId: paymentInfo.val_id,
            sessionId: paymentInfo.sessionkey,
          },
        },
        { new: true }
      )

      // update qr code unique string
      // After payment confirmation and booking update:
      const qrSignature = await updateBookingSignature(bookingId, transactionId)

      // You can include this in the email or response if needed
      // console.log('QR Signature generated:', qrSignature)

      // ✅ Update booking status to confirmed and mark as paid
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentId: transactionId,
          },
        },
        { new: true }
      )

      if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' })
      }

      return res.redirect(
        `${process.env.REDIRECT_CLIENTS}/payment/status?status=success&paymentId=${updatedPayment?._id}`
      )

      // Send confirmation email
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
                      <tr><th>Seats</th><td>${selectedSeats.join(
                        ', '
                      )}</td></tr>
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
        subject: 'Payment Successful - VibePass',
        html: htmlTemplate,
      })
    } else {
      console.warn('Invalid payment status:', paymentInfo.status)
      return res.redirect(
        `${process.env.REDIRECT_CLIENTS}/payment/status?status=invalid`
      )
    }
  } catch (error) {
    console.error('Error in paymentSuccess:', error)
    return res.redirect(
      `${process.env.REDIRECT_CLIENTS}/payment/status?status=error`
    )
  }
}

// ✅ Handle Payment Fail
const paymentFail = async (req, res) => {
  try {
    const paymentInfo = req.body

    // ✅ Get bookingId from paymentInfo (value_a)
    const bookingId = paymentInfo.value_a

    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: paymentInfo.tran_id },
      {
        $set: {
          status: 'failed',
          providerPaymentId: paymentInfo.val_id,
        },
      },
      { new: true }
    )

    // ✅ Update booking status to failed payment
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        $set: {
          paymentStatus: 'failed',
        },
      })
    }

    return res.redirect(
      `${process.env.REDIRECT_CLIENTS}/payment/status?status=fail&paymentId=${updatedPayment?._id}`
    )
  } catch (error) {
    console.error('Error in paymentFail:', error)
    return res.redirect(
      `${process.env.REDIRECT_CLIENTS}/payment/status?status=error`
    )
  }
}

// ✅ Handle Payment Cancel
const paymentCancel = async (req, res) => {
  try {
    const paymentInfo = req.body

    // ✅ Get bookingId from paymentInfo (value_a)
    const bookingId = paymentInfo.value_a

    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: paymentInfo.tran_id },
      {
        $set: {
          status: 'cancelled',
          providerPaymentId: paymentInfo.val_id,
        },
      },
      { new: true }
    )

    // ✅ Update booking status to cancelled
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        $set: {
          paymentStatus: 'cancelled',
          status: 'cancelled',
        },
      })
    }

    return res.redirect(
      `${process.env.REDIRECT_CLIENTS}/payment/status?status=cancel&paymentId=${updatedPayment?._id}`
    )
  } catch (error) {
    console.error('Error in paymentCancel:', error)
    return res.redirect(
      `${process.env.REDIRECT_CLIENTS}/payment/status?status=error`
    )
  }
}

module.exports = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
}
