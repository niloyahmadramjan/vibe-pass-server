const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const users = require('../models/user.js')
const sendEmail = require('../utils/sendEmail.js')
const user = require('../models/user.js')

// Temporary in-memory OTP store (better to use Redis/DB in production)
let otpStore = {}

// Step 1: Send OTP
const sendOtp = async (req, res) => {
  try {
    const { email, name } = req.body
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
    const user = await users.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore[email] = otp

    // Send OTP via email
    await sendEmail(email, 'Password Reset OTP', otp, name || user.name)

    res.json({ success: true, message: 'OTP sent to email' })
  } catch (error) {
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

    // Check OTP validity
    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const user = await users.findOne({ email })
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
    res.status(500).json({ message: error.message })
  }
}




// Weekly Active Users
const getWeeklyUsers = async (req, res) => {
  try {
    const user = await users.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = {
      Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
    };

  user.forEach(item => {
      const dayName = weekDays[item._id - 1];
      if (dayName) {
        result[dayName] = item.count;
      }
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



const getAllUsers = async (req, res) => {
  try {
    const allUsers = await user.find().select("-password"); // use model, not variable
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

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
 
}
