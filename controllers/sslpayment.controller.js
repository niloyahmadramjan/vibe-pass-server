const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const Payment = require('../models/Payment')

// Initiate SSLCommerz Payment
const initiatePayment = async (req, res) => {
  try {
    const {
      transactionId, // optional from frontend, will be replaced by generated one
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

      return res.redirect(
        `${process.env.REDIRECT_CLIENTS}/payment/status?status=success&paymentId=${updatedPayment?._id}`
      )
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
