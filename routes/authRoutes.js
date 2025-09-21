const express = require('express')
const router = express.Router()
const {
  sendOtp,
  verifyOtp,
  registerUser,
} = require('../controllers/authController.js')


router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/register', registerUser)

module.exports = router
