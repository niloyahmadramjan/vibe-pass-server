const Refund = require('../models/Refund');
const Booking = require('../models/Booking');
const { sendRefundConfirmation, sendRefundStatusUpdate } = require('../utils/refundEmailServer');

// @desc    Create a new refund request
// @route   POST /api/refund/request
// @access  Private
const createRefundRequest = async (req, res) => {
  try {
    const {
      bookingId,
      transactionId,
      amount,
      reason,
      userEmail,
      userName,
      movieTitle,
      theaterName,
      showTime,
      selectedSeats
    } = req.body;

    console.log('Received refund request data:', {
      bookingId, transactionId, amount, reason, userEmail, userName
    });

    // Validate required fields
    if (!bookingId || !transactionId || !amount || !reason || !userEmail || !userName) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if booking exists and is eligible for refund
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is paid
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Only paid bookings can be refunded'
      });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Check if there's already a pending refund request for this booking
    const existingRefund = await Refund.findOne({
      bookingId,
      status: 'pending'
    });

    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: 'A refund request is already pending for this booking'
      });
    }

    // Create new refund request
    const refundRequest = new Refund({
      bookingId,
      transactionId,
      amount,
      reason,
      userEmail,
      userName,
      movieTitle,
      theaterName,
      showTime,
      selectedSeats,
      refundAmount: amount,
      status: 'pending'
    });

    await refundRequest.save();

    // Update booking status to reflect refund request
    booking.refundStatus = 'requested';
    booking.refundRequestId = refundRequest._id;
    await booking.save();

    // Send confirmation email with all data
    try {
      await sendRefundConfirmation(userEmail, userName, refundRequest._id, {
        movieTitle,
        theaterName,
        amount,
        showTime,
        selectedSeats,
        transactionId
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: {
        refundId: refundRequest._id,
        status: refundRequest.status,
        submittedAt: refundRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating refund request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund request',
      error: error.message
    });
  }
};

// @desc    Get all refund requests for admin
// @route   GET /api/refund/requests
// @access  Private/Admin
const getAllRefunds = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const refunds = await Refund.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .populate({
        path: 'bookingId',
        select: 'status paymentStatus',
        // Add this to handle missing/deleted bookings
        options: { 
          allowNull: true 
        }
      });

    const total = await Refund.countDocuments(query);

    res.json({
      success: true,
      data: refunds,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRefunds: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    
    // More specific error handling
    if (error.message.includes('split')) {
      return res.status(500).json({
        success: false,
        message: 'Database error: Invalid booking references found',
        error: 'Some refund records reference deleted or invalid bookings'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching refund requests',
      error: error.message
    });
  }
};

// @desc    Get refund requests by user email
// @route   GET /api/refund/user/:email
// @access  Private
const getUserRefunds = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const refunds = await Refund.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Refund.countDocuments({ userEmail: email });

    res.json({
      success: true,
      data: refunds,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRefunds: total
      }
    });
  } catch (error) {
    console.error('Error fetching user refund requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching refund requests',
      error: error.message
    });
  }
};

// @desc    Get single refund request by ID
// @route   GET /api/refund/:id
// @access  Private
const getRefundById = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id)
      .populate('bookingId');

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    res.json({
      success: true,
      data: refund
    });
  } catch (error) {
    console.error('Error fetching refund request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching refund request',
      error: error.message
    });
  }
};

// @desc    Update refund request status (Admin only)
// @route   PUT /api/refund/:id/status
// @access  Private/Admin
const updateRefundStatus = async (req, res) => {
  try {
    const { status, adminNotes, refundAmount } = req.body;
    
    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'processed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    refund.status = status;
    if (adminNotes) refund.adminNotes = adminNotes;
    if (refundAmount) refund.refundAmount = refundAmount;
    
    if (status === 'processed') {
      refund.processedAt = new Date();
      
      // Update booking status when refund is processed
      const booking = await Booking.findById(refund.bookingId);
      if (booking) {
        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        await booking.save();
      }
    }

    await refund.save();

    // Send status update email
    try {
      await sendRefundStatusUpdate(refund.userEmail, refund.userName, refund._id, status);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json({
      success: true,
      message: `Refund request ${status} successfully`,
      data: refund
    });
  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating refund status',
      error: error.message
    });
  }
};

// @desc    Cancel refund request
// @route   PUT /api/refund/:id/cancel
// @access  Private
const cancelRefundRequest = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);
    
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    if (refund.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending refund requests can be cancelled'
      });
    }

    refund.status = 'cancelled';
    await refund.save();

    // Update booking status
    const booking = await Booking.findById(refund.bookingId);
    if (booking) {
      booking.refundStatus = 'cancelled';
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Refund request cancelled successfully',
      data: refund
    });
  } catch (error) {
    console.error('Error cancelling refund request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling refund request',
      error: error.message
    });
  }
};

module.exports = {
  createRefundRequest,
  getAllRefunds,
  getUserRefunds,
  getRefundById,
  updateRefundStatus,
  cancelRefundRequest
};