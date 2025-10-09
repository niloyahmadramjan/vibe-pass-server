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
  updateUser,
} = require('../controllers/authController.js')
const adminOnly = require('../middlewares/adminOnly');

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/register', registerUser)
router.post('/social-login', socialLogin)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
// for admin ..........................
router.get("/weekly-users",adminOnly, getWeeklyUsers);
// GET all users
router.get("/", getAllUsers);
router.delete("/:id", deleteUser)
// Admin update user info
router.put("/:id", adminOnly, updateUser)

module.exports = router
