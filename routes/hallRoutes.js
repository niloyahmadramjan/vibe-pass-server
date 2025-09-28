const express = require('express')
const { getHallDistribution } = require('../controllers/hallController')

const router = express.Router()

// GET /api/hall-distribution
router.get('/', getHallDistribution)

module.exports = router
