const express = require('express')
const {
  initiatePayment,
  confirmPayment,
  getWeeklyRevenue,
  getAllPaymentData,
  getPaymentsByEmail,
  getPaymentById,
} = require('../controllers/paymentController')
const adminOnly = require('../middlewares/adminOnly')
const verifyToken = require('../middlewares/verifyToken')
const Stripe = require('stripe')

const router = express.Router()
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

//  Controller-based routes
router.post('/', initiatePayment)
router.post('/confirm-payment', confirmPayment)
router.get('/user', getPaymentsByEmail)
router.get('/weekly-revenue', verifyToken, adminOnly, getWeeklyRevenue)
router.get('/', getAllPaymentData)
router.get('/:id', getPaymentById)
// Direct Stripe PaymentIntent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Amount is required and must be greater than 0',
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' },
    })

    res.json({ clientSecret: paymentIntent.client_secret, success: true })
  } catch (error) {
    console.error('Payment Intent Error:', error)
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error.message,
    })
  }
})

// ✅ Dummy Save Payment
router.post('/save-payment', async (req, res) => {
  try {
    // // console.log("💾 Payment Saved:", req.body);
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save payment' })
  }
})

module.exports = router
