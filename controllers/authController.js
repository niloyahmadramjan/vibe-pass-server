const bcrypt = require('bcryptjs')
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const sendEmail = require('../utils/sendEmail.js')

dotenv.config();

// Temporary in-memory OTP store (better to use Redis/DB in production)
let otpStore = {}
let verifiedEmails = {} // to track verified OTPs

const JWT_SECRET = process.env.JWT_SECRET

// Step 1: Send OTP
const sendOtp = async (req, res) => {
  try {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore[email] = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    }

    // Send email with OTP
    await sendEmail(email, 'Your OTP Code', otp, name)
    console.log(otp)

    res.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ message: error.message })
  }
}

// Step 2: Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    const record = otpStore[email]

    if (!record) {
      return res
        .status(400)
        .json({ success: false, message: 'OTP not found or expired' })
    }

    // Check if OTP is expired
    if (record.expiresAt < Date.now()) {
      delete otpStore[email]
      return res.status(400).json({ success: false, message: 'OTP expired' })
    }

    // Match OTP
    if (record.code === otp) {
      verifiedEmails[email] = true
      delete otpStore[email]
      return res.json({ success: true, message: 'OTP verified' })
    }

    return res.status(400).json({ success: false, message: 'Invalid OTP' })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ message: error.message })
  }
}

// Step 3: Register user (only if OTP is verified)
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Check if OTP was verified
    if (!verifiedEmails[email]) {
      return res.status(400).json({ message: 'OTP not verified or expired' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    })

    // Clear OTP after success
    delete verifiedEmails[email]

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '1d',
    })

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Register user error:', error)
    res.status(500).json({ message: error.message })
  }
}

// Step 4: Social Login (Google, GitHub, etc
const socialLogin = async (req, res) => {
  try {
    const { email, name, image, provider } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // check if user exists
    let user = await User.findOne({ email })

    if (!user) {
      // create new user without password
      user = await User.create({
        name,
        email,
        image,
        provider,
        password: null, // optional, or generate random
      })
    }

    // create custom JWT (valid for 1 day)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // return JWT to NextAuth
    res.json({ success: true, token, user })
  } catch (error) {
    console.error('Social login failed:', error)
    res.status(500).json({ message: 'Server error during social login' })
  }
}






const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Check if user exists
    const user = await User.findOne({ email })
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
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
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

// ✅ Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
  try {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore[email] = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    }

    // Send OTP via email
    await sendEmail(email, 'Password Reset OTP', otp, name || user.name)

    res.json({ success: true, message: 'OTP sent to email' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: error.message })
  }
}

// ✅ Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // // Check OTP validity
    // const record = otpStore[email]
    // if (!record || record.code !== otp || record.expiresAt < Date.now()) {
    //   return res.status(400).json({ message: 'Invalid or expired OTP' })
    // }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    await user.save()

    // Clear OTP
    delete otpStore[email]

    res.json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: error.message })
  }
}

// Weekly Active Users
const getWeeklyUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ])

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const result = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    }

    users.forEach((item) => {
      const dayName = weekDays[item._id - 1]
      if (dayName) {
        result[dayName] = item.count
      }
    })

    res.json(result)
  } catch (err) {
    console.error('Weekly users error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// get all users
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().select('-password')
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: 'No users found' })
    }
    res.status(200).json(allUsers)
  } catch (err) {
    console.error('Get all users error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await User.findByIdAndDelete(id)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// Update user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    })
  } catch (error) {
    console.error('Update user error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Export functions
module.exports = {
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
}
