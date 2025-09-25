const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const users = require('../models/user.js')
const sendEmail = require('../utils/sendEmail.js')

// Temporary in-memory OTP store (better to use Redis/DB in production)
let otpStore = {}

// Step 1: Send OTP
const sendOtp = async (req, res) => {
  try {
    const { email, name, phone } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore[email] = otp

    // Send email with OTP
  await sendEmail(email, 'Your OTP Code', otp, name)

    res.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Step 2: Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    // Check if OTP matches
    if (otpStore[email] && otpStore[email] === otp) {
      return res.json({ success: true, message: 'OTP verified' })
    }

    return res.status(400).json({ success: false, message: 'Invalid OTP' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Step 3: Register user (only if OTP is verified)
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Check if OTP was verified
    if (!otpStore[email]) {
      return res.status(400).json({ message: 'OTP not verified' })
    }

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await users.create({
      name,
      email,
      phone,
      password: hashedPassword,
    })

    // Clear OTP after success
    delete otpStore[email]

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })

    // Send response
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Step 4: Social Login (Google, GitHub, etc.)
const socialLogin = async (req, res) => {
  const { email, name, image, provider } = req.body
  try {
    let user = await users.findOne({ email })

    if (!user) {
      // Create user without password (social login only)
      user = new users({ email, name, image, provider })
      await user.save()
    }

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Check if user exists
    const user = await users.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // 1 day
    )

    // 4. Return response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Export functions
module.exports = { sendOtp, verifyOtp, registerUser, socialLogin, login }
