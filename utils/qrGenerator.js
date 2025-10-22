const QRCode = require('qrcode')

// QR generator function (simple, reusable)
async function generateQRLink(qrSignature) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const verifyLink = `${frontendUrl}/verify-qr/${qrSignature}`

  // Generate QR as Base64 image URL
  const qrDataUrl = await QRCode.toDataURL(verifyLink, {
    errorCorrectionLevel: 'H', // High correction = easier to scan
    width: 250, // Size of QR
    margin: 2, // White border size
    color: {
      dark: '#000000', // QR color
      light: '#FFFFFF', // Background color
    },
  })

  return qrDataUrl
}

module.exports = { generateQRLink }
