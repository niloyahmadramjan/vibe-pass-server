const express = require('express')
const router = express.Router()

const {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} = require('../controllers/sslpayment.controller')

router.post('/initiate', initiatePayment)
router.post('/success', paymentSuccess)
router.post('/fail', paymentFail)
router.post('/cancel', paymentCancel)

module.exports = router
