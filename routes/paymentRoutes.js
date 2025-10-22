// ===============================
// 💳 Payment Routes
// ===============================
const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// ===============================
// 📦 Import Controllers & Middleware
// ===============================
const {
  initiatePayment,
  confirmPayment,
  getWeeklyRevenue,
  getAllPaymentData,
  getPaymentsByEmail,
  getPaymentById,
} = require('../controllers/paymentController')

const verifyToken = require('../middlewares/verifyToken')

router.post('/', verifyToken, initiatePayment)
router.post('/confirm-payment', verifyToken, confirmPayment)
router.get('/user', verifyToken, getPaymentsByEmail)
router.get('/weekly-revenue', verifyToken, getWeeklyRevenue)
router.get('/', verifyToken, getAllPaymentData)
router.get('/:id', verifyToken, getPaymentById)

// ===============================
// 💰 Direct Stripe PaymentIntent Creation
// ===============================
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Amount is required and must be greater than 0',
      })
    }

    // ✅ Stripe expects smallest currency unit (cents)
    const amountInCents = Math.round(amount * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' },
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      success: true,
    })
  } catch (error) {
    console.error('❌ Payment Intent Error:', error)
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error.message,
    })
  }
})

// ===============================
// 💾 Dummy Save Payment Endpoint (for testing)
// ===============================
router.post('/save-payment', async (req, res) => {
  try {
    // console.log("💾 Payment Saved:", req.body);
    res.json({ success: true })
  } catch (err) {
    console.error('❌ Save Payment Error:', err)
    res.status(500).json({ error: 'Failed to save payment' })
  }
})

// ===============================
// ✅ Export Router
// ===============================
module.exports = router
