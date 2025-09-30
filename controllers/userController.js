const User = require('../models/user')
const axios = require('axios')


const getUserInfo = async (req, res) => {
  try {
    
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

// Change PIN
const changePin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body
    const user = await User.findById(req.user.id)

    if (user.pin !== oldPin) {
      return res.status(400).json({ success: false, message: 'Invalid PIN' })
    }

    user.pin = newPin
    await user.save()
    res.json({ success: true, message: 'PIN changed' })
  } catch (err) {
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
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // ✅ Validate file
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files allowed' })
    }
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 5MB)' })
    }

    // ✅ Convert to base64
    const base64Image = req.file.buffer.toString('base64')

    // ✅ Upload to ImgBB
    const formData = new URLSearchParams()
    formData.append('image', base64Image)

    const imgbbRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const imageUrl = imgbbRes.data.data.url

    // ✅ Save in MongoDB
    await User.findByIdAndUpdate(req.user.id, { image: imageUrl })

    return res.json({ success: true, imageUrl })
  } catch (err) {
    console.error('Image upload error:', err.response?.data || err.message)
    return res.status(500).json({ error: 'Upload failed' })
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
