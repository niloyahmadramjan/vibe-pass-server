// routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const {
  subscribe,
  getAllSubscribers,
  updateSubscriber,
  deleteSubscriber,
  getSubscriptionStats
} = require('../controllers/subscriberController');

// POST /api/subscribe - Create new subscription
router.post('/subscribe', subscribe);

// GET /api/subscribe - Get all subscribers (for admin)
router.get('/', getAllSubscribers);

// GET /api/subscribe/stats - Get subscription statistics
router.get('/subscribe/stats', getSubscriptionStats);

// PUT /api/subscribe/:id - Update subscriber
router.put('/subscribe/:id', updateSubscriber);

// DELETE /api/subscribe/:id - Delete subscriber
router.delete('/subscribe/:id', deleteSubscriber);

module.exports = router;
