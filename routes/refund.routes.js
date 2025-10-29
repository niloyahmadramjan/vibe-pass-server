const express = require('express');
const router = express.Router();
const {
  createRefundRequest,
  getAllRefunds,
  getUserRefunds,
  getRefundById,
  updateRefundStatus,
  cancelRefundRequest
} = require('../controllers/refundController');

// POST /api/refund/request - Create new refund request
router.post('/request', createRefundRequest);

// GET /api/refund/requests - Get all refunds (admin)
router.get('/requests', getAllRefunds);

// GET /api/refund/user/:email - Get user's refund requests
router.get('/user/:email', getUserRefunds);

// GET /api/refund/:id - Get single refund request
router.get('/:id', getRefundById);

// PUT /api/refund/:id/status - Update refund status (admin)
router.put('/:id/status', updateRefundStatus);

// PUT /api/refund/:id/cancel - Cancel refund request
router.put('/:id/cancel', cancelRefundRequest);

module.exports = router;