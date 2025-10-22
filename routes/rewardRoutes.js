const express = require('express')
const Reward = require('../models/rewardModel')
const router = express.Router()

// Get or create user reward
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params
    if (!email) return res.status(400).json({ error: 'Email is required' })

    let reward = await Reward.findOne({ userEmail: email })
    if (!reward) {
      reward = await Reward.create({
        userEmail: email,
        points: 0,
        dailyStreak: 0,
        totalRedeemed: 0,
        redeemedHistory: [],
      })
    }

    res.status(200).json(reward)
  } catch (err) {
    console.error('Error fetching reward:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Claim reward
router.post('/claim', async (req, res) => {
  // console.log("🟢 Incoming claim request:", req.body);
  try {
    const { email, type } = req.body
    if (!email || !type) {
      return res.status(400).json({ message: 'Email and type are required' })
    }

    const reward = await Reward.findOne({ userEmail: email })
    if (!reward) return res.status(404).json({ message: 'User not found' })

    const now = new Date()
    let points = 0

    // DAILY
    if (type === 'daily') {
      const last = reward.lastDailyClaim
        ? new Date(reward.lastDailyClaim)
        : null
      if (last && last.toDateString() === now.toDateString())
        return res.status(400).json({ message: 'Already claimed today' })

      if (last && now - last < 48 * 60 * 60 * 1000) reward.dailyStreak += 1
      else reward.dailyStreak = 1

      reward.lastDailyClaim = now
      points = 5
    }

    // WEEKLY
    if (type === 'weekly') {
      if (reward.dailyStreak < 7)
        return res
          .status(400)
          .json({ message: 'Need 7-day streak to claim weekly bonus' })

      const lastWeekly = reward.lastWeeklyClaim
        ? new Date(reward.lastWeeklyClaim)
        : null
      if (lastWeekly && now - lastWeekly < 7 * 24 * 60 * 60 * 1000)
        return res.status(400).json({ message: 'Weekly bonus already claimed' })

      reward.lastWeeklyClaim = now
      points = 50
    }

    // MONTHLY
    if (type === 'monthly') {
      if (reward.dailyStreak < 28)
        return res
          .status(400)
          .json({ message: 'Need 28-day streak to claim monthly bonus' })

      const lastMonthly = reward.lastMonthlyClaim
        ? new Date(reward.lastMonthlyClaim)
        : null
      if (lastMonthly && now - lastMonthly < 30 * 24 * 60 * 60 * 1000)
        return res
          .status(400)
          .json({ message: 'Monthly bonus already claimed' })

      reward.lastMonthlyClaim = now
      points = 200
    }

    reward.points += points
    await reward.save()

    res.json({ message: `You earned ${points} points!`, reward })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Redeem points
router.post('/redeem', async (req, res) => {
  try {
    const { email, points } = req.body
    if (!email || !points)
      return res.status(400).json({ message: 'Email and points are required' })

    const reward = await Reward.findOne({ userEmail: email })
    if (!reward) return res.status(404).json({ message: 'User not found' })

    if (reward.points < points)
      return res.status(400).json({ message: 'Not enough points' })

    const cash = (points / 100) * 5 // 100 pts = ৳5
    reward.points -= points
    reward.totalRedeemed += cash
    reward.redeemedHistory.push({ points, amount: cash, date: new Date() })
    await reward.save()

    res.json({ message: `Redeemed ${points} points for ৳${cash}`, reward })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
