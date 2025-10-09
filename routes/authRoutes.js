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
const verifyToken= require("../middlewares/verifyToken")

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/register', registerUser)
router.post('/social-login', socialLogin)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
// for admin ..........................
router.get("/weekly-users", adminOnly, getWeeklyUsers);
// GET all users
router.get("/", verifyToken, adminOnly, getAllUsers);
router.delete("/:id", verifyToken,adminOnly, deleteUser)
// Admin update user info
router.put("/:id", verifyToken, adminOnly, updateUser)



module.exports = router
