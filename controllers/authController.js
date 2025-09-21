const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User.js')
const sendEmail = require('../utils/sendEmail.js')

// Temporary in-memory OTP store
let otpStore = {}

const sendOtp = async (req, res) => {
  try {
    const { email, name, phone } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore[email] = otp

    // Send email
    await sendEmail(email, 'Your OTP Code', `Hello ${name}, your OTP is ${otp}`)

    res.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (otpStore[email] && otpStore[email] === otp) {
      return res.json({ success: true, message: 'OTP verified' })
    }
    return res.status(400).json({ success: false, message: 'Invalid OTP' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Ensure OTP verified
    if (!otpStore[email]) {
      return res.status(400).json({ message: 'OTP not verified' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    })

    delete otpStore[email] // clear OTP after success

    // JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


module.exports = { sendOtp, verifyOtp, registerUser }