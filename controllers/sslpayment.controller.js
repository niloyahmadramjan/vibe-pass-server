const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const Payment = require('../models/Payment') 

// Initiate SSLCommerz Payment
const initiatePayment = async (req, res) => {
  try {
    const {
      cus_name,
      cus_phone,
      cus_email,
      total_amount,
      bookingId,
      userId,
      sessionTitle,
    } = req.body

    if (!cus_name || !cus_email || !total_amount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const txs_id = uuidv4()
    const tran_id = `Inv-${txs_id}`

    const data = {
      store_id: process.env.STORE_ID,
      store_passwd: process.env.STORE_PASS,
      total_amount: parseFloat(total_amount),
      currency: 'BDT',
      tran_id,

      success_url: `${process.env.REDIRECT_URL}/success`,
      fail_url: `${process.env.REDIRECT_URL}/fail`,
      cancel_url: `${process.env.REDIRECT_URL}/cancel`,
      ipn_url: `${process.env.REDIRECT_URL}/ipn`,

      product_name: sessionTitle || 'Movie Ticket',
      product_category: 'Entertainment',
      product_profile: 'general',

      cus_name,
      cus_email,
      cus_add1: '123 Street',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone,

      value_a: txs_id,
      value_b: bookingId || 'N/A',
      value_c: userId || 'N/A',
      value_d: 'custom_d',
    }

    // SSLCommerz API request
    const response = await axios({
      method: 'POST',
      url: process.env.BKASH_URL,
      data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const gatewayURL = response.data?.GatewayPageURL

    // Create payment document in MongoDB
    await Payment.create({
      bookingId,
      userId,
      userEmail: cus_email,
      amount: total_amount,
      currency: 'BDT',
      provider: 'sslcommerz',
      transactionId: tran_id,
      sessionTitle: sessionTitle || 'N/A',
      status: 'pending',
    })

    if (gatewayURL) {
      return res.status(200).json({ GatewayPageURL: gatewayURL })
    } else {
      return res
        .status(500)
        .json({
          error: 'Failed to get GatewayPageURL',
          response: response.data,
        })
    }
  } catch (error) {
    console.error(
      'Payment initiation error:',
      error.response?.data || error.message
    )
    return res
      .status(500)
      .json({ error: 'Payment initiation failed', details: error.message })
  }
}

// Handle Payment Success
const paymentSuccess = async (req, res) => {
  try {
    const paymentInfo = req.body

    if (paymentInfo.status === 'VALID') {
      await Payment.findOneAndUpdate(
        { transactionId: paymentInfo.tran_id },
        {
          $set: {
            status: 'paid',
            providerPaymentId: paymentInfo.val_id,
            sessionId: paymentInfo.sessionkey,
            updatedAt: new Date(),
          },
        }
      )

      return res.redirect(`${process.env.REDIRECT_CLIENTS}/success`)
    } else {
      console.warn('Invalid payment status:', paymentInfo.status)
      return res.redirect(`${process.env.REDIRECT_CLIENTS}/invalid`)
    }
  } catch (error) {
    console.error('Error in paymentSuccess:', error)
    return res.redirect(`${process.env.REDIRECT_CLIENTS}/error`)
  }
}

// Handle Payment Fail
const paymentFail = async (req, res) => {
  try {
    const paymentInfo = req.body

    await Payment.findOneAndUpdate(
      { transactionId: paymentInfo.tran_id },
      {
        $set: {
          status: 'failed',
          providerPaymentId: paymentInfo.val_id,
          updatedAt: new Date(),
        },
      }
    )

    return res.redirect(`${process.env.REDIRECT_CLIENTS}/fail`)
  } catch (error) {
    console.error('Error in paymentFail:', error)
    return res.redirect(`${process.env.REDIRECT_CLIENTS}/error`)
  }
}

// Handle Payment Cancel
const paymentCancel = async (req, res) => {
  try {
    const paymentInfo = req.body

    await Payment.findOneAndUpdate(
      { transactionId: paymentInfo.tran_id },
      {
        $set: {
          status: 'cancelled',
          providerPaymentId: paymentInfo.val_id,
          updatedAt: new Date(),
        },
      }
    )

    return res.redirect(`${process.env.REDIRECT_CLIENTS}/cancel`)
  } catch (error) {
    console.error('Error in paymentCancel:', error)
    return res.redirect(`${process.env.REDIRECT_CLIENTS}/error`)
  }
}

module.exports = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
}
