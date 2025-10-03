const express = require('express')
const router = express.Router()
const {
  sendOtp,
  verifyOtp,
  registerUser,
  socialLogin,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController.js')

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/register', registerUser)
router.post('/social-login', socialLogin)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router
