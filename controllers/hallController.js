const mongoose = require('mongoose')

// Get hall distribution data
const getHallDistribution = async (req, res) => {
  try {
    const data = await mongoose.connection.db
      .collection('hallDistribution') 
      .find({})
      .toArray()

    res.status(200).json(data)
  } catch (error) {
    console.error('❌ Error fetching hallDistribution:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getHallDistribution }
