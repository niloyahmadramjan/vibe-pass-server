// utils/updateBookingSignature.js
const Booking = require('../models/Booking')
const jwt = require('jsonwebtoken')

/**
 * 🔗 updateBookingSignature
 * Generates and updates a secure JWT-based QR signature for booking verification.
 *
 * @param {String} bookingId - The MongoDB _id of the booking
 * @param {String} transactionId - The payment transaction ID
 * @returns {String} JWT token containing booking verification data
 */
const updateBookingSignature = async (bookingId, transactionId) => {
  try {
    if (!bookingId || !transactionId) {
      throw new Error('Missing bookingId or transactionId')
    }

    // Find the booking to get necessary data for the payload
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }

    // Create JWT payload with essential booking data
    const payload = {
      bookingId: booking._id.toString(),
      transactionId: transactionId,
      showDate: booking.showDate,
      showTime: booking.showTime,
      userId: booking.userId,
      // Add timestamp to prevent replay attacks
      iat: Math.floor(Date.now() / 1000),
      // Optional: Add expiration (e.g., 30 days from now)
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    }

    // Generate JWT token using your secret
    const qrSignature = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: 'HS256',
    })

    // Update the booking with the QR signature
    await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          qrSignature: qrSignature,
          lastQRUpdate: new Date(),
        },
      },
      { new: true }
    )

    // console.log(`✅ QR signature generated for booking: ${bookingId}`)
    return qrSignature
  } catch (error) {
    console.error('❌ Error updating booking signature:', error)
    throw error
  }
}

/**
 * 🔍 verifyBookingSignature
 * Verifies the JWT QR signature and returns the decoded booking data
 *
 * @param {String} qrSignature - The JWT token from QR code
 * @returns {Object} Decoded booking data if valid
 */
const verifyBookingSignature = async (qrSignature) => {
  try {
    if (!qrSignature) {
      throw new Error('QR signature is required')
    }

    // Verify JWT token
    const decoded = jwt.verify(qrSignature, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    })

    // Additional verification: Check if booking exists and signature matches
    const booking = await Booking.findOne({
      _id: decoded.bookingId,
      qrSignature: qrSignature,
    })

    if (!booking) {
      throw new Error('Invalid QR signature or booking not found')
    }

    // Check if the booking is still valid (not cancelled, etc.)
    if (booking.status !== 'confirmed') {
      throw new Error('Booking is not confirmed')
    }

    // Return both decoded data and booking document
    return {
      isValid: true,
      bookingData: decoded,
      bookingDocument: booking,
    }
  } catch (error) {
    console.error('❌ QR signature verification failed:', error.message)

    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid QR code')
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('QR code has expired')
    } else {
      throw error
    }
  }
}

/**
 * 🔄 refreshBookingSignature
 * Refresh the QR signature if needed (e.g., for extended validity)
 */
const refreshBookingSignature = async (bookingId, transactionId) => {
  try {
    return await updateBookingSignature(bookingId, transactionId)
  } catch (error) {
    console.error('❌ Error refreshing booking signature:', error)
    throw error
  }
}

module.exports = {
  updateBookingSignature,
  verifyBookingSignature,
  refreshBookingSignature,
}
