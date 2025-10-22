const User = require('../models/user')
const bcrypt = require('bcryptjs')

const getUserInfo = async (req, res) => {
  try {
    // console.log(req.user)
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
}

// Update mobile number
const updateMobile = async (req, res) => {
  try {
    const { number } = req.body
    await User.findByIdAndUpdate(req.user.id, { phone: number })
    res.json({ success: true, message: 'Mobile updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Send verification email (stubbed)
const verifyEmail = async (req, res) => {
  try {
    // TODO: integrate with nodemailer/sendgrid
    res.json({ success: true, message: 'Verification email sent' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Update profile info
const updateProfile = async (req, res) => {
  try {
    const { name, dob, state, district, gender } = req.body
    await User.findByIdAndUpdate(req.user.id, {
      name,
      dob,
      state,
      district,
      gender,
    })
    res.json({ success: true, message: 'Profile updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Update communication preferences
const updatePreferences = async (req, res) => {
  try {
    const { updates, surveys } = req.body
    await User.findByIdAndUpdate(req.user.id, { updates, surveys })
    res.json({ success: true, message: 'Preferences updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

const changePin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Compare old pin with hashed password
    const isMatch = await bcrypt.compare(oldPin, user.password)
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid old pin' })
    }

    // Hash new pin before saving
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPin, salt)

    await user.save()

    res.json({ success: true, message: 'Pin changed successfully' })
  } catch (err) {
    console.error('Error changing pin:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

// Delete account
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id)
    res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Contact support (store message or send email)
const contactSupport = async (req, res) => {
  try {
    const { message } = req.body
    // Save to DB or forward via email
    res.json({ success: true, message: 'Support request sent', data: message })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id // comes from verifyToken middleware
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' })
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: 'Profile image updated successfully',
      imageUrl: updatedUser.image,
    })
  } catch (error) {
    console.error('Error updating profile image:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  updateMobile,
  verifyEmail,
  updateProfile,
  updatePreferences,
  changePin,
  deleteAccount,
  contactSupport,
  getUserInfo,
  uploadProfileImage,
}
