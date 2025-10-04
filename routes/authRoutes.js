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
  getWeeklyUsers,
  getAllUsers,
  deleteUser,
} = require('../controllers/authController.js')

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/register', registerUser)
router.post('/social-login', socialLogin)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get("/weekly-users", getWeeklyUsers);
// GET all users
router.get("/", getAllUsers);
router.delete("/:id", deleteUser)


module.exports = router
