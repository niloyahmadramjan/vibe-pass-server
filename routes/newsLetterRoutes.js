const express = require('express')
const router = express.Router()
const axios = require('axios')
const Subscriber = require('../models/Subscriber')

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body

    // ✅ 1. Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email address' })
    }

    // ✅ 2. Check if already subscribed
    const existing = await Subscriber.findOne({ email })
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already subscribed' })
    }

    // ✅ 3. Fetch IP info from ipapi.co
    let ipData = {}
    try {
      const response = await axios.get('https://ipapi.co/json/')
      ipData = response.data
    } catch (ipError) {
      console.error('IP API error:', ipError.message)
      ipData = {} // fallback empty
    }

    // ✅ 4. Create new subscriber with IP data
    const subscriber = new Subscriber({
      email,
      ip: ipData.ip,
      city: ipData.city,
      region: ipData.region,
      country: ipData.country_name || ipData.country,
      postal: ipData.postal,
      latitude: ipData.latitude,
      longitude: ipData.longitude,
      timezone: ipData.timezone,
      org: ipData.org,
    })

    await subscriber.save()

    return res
      .status(200)
      .json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Subscribe error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Server error, try again later' })
  }
})

module.exports = router
