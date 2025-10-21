const express = require('express')
const router = express.Router()
const { verifyBookingSignature } = require('../utils/updateBookingSignature')

// ✅ Verify QR Code
router.post('/', async (req, res) => {
  try {
    const { qrSignature } = req.body

    if (!qrSignature) {
      return res.status(400).json({
        success: false,
        message: 'QR signature is required',
      })
    }

    const verificationResult = await verifyBookingSignature(qrSignature)

    res.json({
      success: true,
      message: 'QR code verified successfully',
      data: {
        booking: verificationResult.bookingDocument,
        verification: verificationResult.bookingData,
      },
    })
  } catch (error) {
    console.error('QR verification error:', error)
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
