const express = require('express')
const router = express.Router()
const PdfPrinter = require('pdfmake/src/printer')
const Booking = require('../models/Booking')
const path = require('path')
const fs = require('fs')
const { generateQRLink } = require('../utils/qrGenerator')
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

// Fonts for pdfmake
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
}

const printer = new PdfPrinter(fonts)

// Function to convert image to base64
const imageToBase64 = (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    return `data:image/png;base64,${imageBuffer.toString('base64')}`
  } catch (error) {
    console.error('Error reading logo file:', error)
    return null
  }
}

router.post('/', async (req, res) => {
  try {
    const { bookingId } = req.body

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required',
      })
    }

    // Find booking by ID
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      })
    }

    // Check if payment is paid
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed for this booking',
      })
    }

    // Extract booking data
    const {
      movieTitle,
      theaterName,
      showDate,
      showTime,
      selectedSeats,
      totalAmount,
      userName,
      userEmail,
      screen,
      status,
      qrSignature,
      _id: bookingIdFromDB,
    } = booking

    // Generate transaction ID from booking ID or use existing
    const transactionId = `TXN-${bookingIdFromDB
      .toString()
      .slice(-8)
      .toUpperCase()}`

      // QR DATA URL
    const qrDataUrl = await generateQRLink(qrSignature)

    // Get VibePass logo (assuming logo is in public folder)
    const logoPath = path.join(process.cwd(), 'public', 'nav_log2.png')
    const logoBase64 = imageToBase64(logoPath)

    // Format dates
    const issueDate = new Date().toLocaleDateString('en-GB')
    const issueTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const journeyDate = new Date(showDate).toLocaleDateString('en-GB')
    const showDateTime = new Date(showDate)
    const [hours, minutes] = showTime.match(/\d+/g)
    showDateTime.setHours(
      parseInt(hours) + (showTime.includes('PM') && hours !== '12' ? 12 : 0)
    )
    showDateTime.setMinutes(parseInt(minutes))

    // PDF document definition - Full one page design

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20],
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.3,
      },
      content: [
        // Header Section
        {
          stack: [
            {
              canvas: [
                { type: 'rect', x: 0, y: 0, w: 555, h: 70, color: '#CC2027' },
              ],
            },
            {
              columns: [
                {
                  width: '20%',
                  stack: logoBase64
                    ? [
                        {
                          image: logoBase64,
                          width: 80,
                          height: 60,
                          alignment: 'left',
                          margin: [0, 0, 0, 0],
                        },
                      ]
                    : [
                        {
                          text: 'VIBEPASS',
                          fontSize: 12,
                          bold: true,
                          color: '#FFFFFF',
                          alignment: 'left',
                          margin: [15, 20, 0, 0],
                        },
                      ],
                },
                {
                  width: '60%',
                  stack: [
                    {
                      text: 'VIBEPASS E-TICKET',
                      fontSize: 20,
                      bold: true,
                      color: '#FFFFFF',
                      alignment: 'center',
                      margin: [0, 15, 0, 3],
                    },
                    {
                      text: 'Movie Ticket - Digital Copy',
                      fontSize: 10,
                      color: '#FFFFFF',
                      alignment: 'center',
                      margin: [0, 0, 0, 0],
                    },
                  ],
                },
                {
                  width: '20%',
                  stack: [
                    {
                      text: 'CONFIRMED',
                      fontSize: 10,
                      bold: true,
                      color: '#FFFFFF',
                      background: '#CC2027', // VibePass brand red
                      alignment: 'center',
                      margin: [0, 12, 15, 3],
                      border: [1, 1, 1, 1],
                      borderColor: '#A8181E',
                      borderRadius: 4,
                      padding: [10, 6, 10, 6],
                      decoration: 'underline',
                      decorationColor: '#FFFFFF',
                      decorationStyle: 'solid',
                    },
                    {
                      text: 'PAID',
                      fontSize: 9,
                      bold: true,
                      color: '#FFFFFF',
                      background: '#10B981', // Success green
                      alignment: 'center',
                      margin: [0, 0, 0, 0],
                      border: [1, 1, 1, 1],
                      borderColor: '#0D9C6F',
                      borderRadius: 10,
                      padding: [8, 8, 8, 8],
                    },
                  ],
                },
              ],
              absolutePosition: { x: 25, y: 25 },
            },
          ],
          margin: [0, 0, 0, 25],
        },

        // Greeting Section
        {
          text: [
            { text: 'Dear ', fontSize: 11 },
            {
              text: `${userName || 'Valued Customer'},`,
              fontSize: 11,
              bold: true,
            },
          ],
          margin: [0, 0, 0, 8],
        },
        {
          text: 'Your request to book e-ticket for your movie experience was successful. Please present this e-ticket at the theater entrance.',
          fontSize: 9,
          color: '#555555',
          margin: [0, 0, 0, 20],
        },

        // Main Content Columns
        {
          columns: [
            // Left Column - Booking Details
            {
              width: '65%',
              stack: [
                // Movie Information
                {
                  table: {
                    widths: ['40%', '60%'],
                    body: [
                      [
                        {
                          text: 'MOVIE INFORMATION',
                          colSpan: 2,
                          bold: true,
                          fontSize: 11,
                          color: '#FFFFFF',
                          fillColor: '#CC2027',
                          margin: [8, 6, 8, 6],
                          border: [false, false, false, false],
                        },
                        {},
                      ],
                      [
                        {
                          text: 'Movie Title',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: movieTitle,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'Theater Name',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: theaterName,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'Screen',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: screen || 'Main Hall',
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0,
                  },
                  margin: [0, 0, 0, 15],
                },

                // Show Details
                {
                  table: {
                    widths: ['40%', '60%'],
                    body: [
                      [
                        {
                          text: 'SHOW DETAILS',
                          colSpan: 2,
                          bold: true,
                          fontSize: 11,
                          color: '#FFFFFF',
                          fillColor: '#CC2027',
                          margin: [8, 6, 8, 6],
                          border: [false, false, false, false],
                        },
                        {},
                      ],
                      [
                        {
                          text: 'Show Date',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: journeyDate,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'Show Time',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: showTime,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'Selected Seats',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: selectedSeats.join(', '),
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'No. of Seats',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: selectedSeats.length.toString(),
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0,
                  },
                  margin: [0, 0, 0, 15],
                },

                // Customer Information
                {
                  table: {
                    widths: ['40%', '60%'],
                    body: [
                      [
                        {
                          text: 'CUSTOMER INFORMATION',
                          colSpan: 2,
                          bold: true,
                          fontSize: 11,
                          color: '#FFFFFF',
                          fillColor: '#CC2027',
                          margin: [8, 6, 8, 6],
                          border: [false, false, false, false],
                        },
                        {},
                      ],
                      [
                        {
                          text: 'Customer Name',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: userName || 'Guest',
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'Email Address',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: userEmail,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0,
                  },
                  margin: [0, 0, 0, 15],
                },

                // Payment Information
                {
                  table: {
                    widths: ['40%', '60%'],
                    body: [
                      [
                        {
                          text: 'PAYMENT INFORMATION',
                          colSpan: 2,
                          bold: true,
                          fontSize: 11,
                          color: '#FFFFFF',
                          fillColor: '#CC2027',
                          margin: [8, 6, 8, 6],
                          border: [false, false, false, false],
                        },
                        {},
                      ],
                      [
                        {
                          text: 'Transaction ID',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: transactionId,
                          fontSize: 8,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'Booking ID',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: bookingIdFromDB.toString(),
                          fontSize: 8,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                      [
                        {
                          text: 'Total Amount Paid',
                          bold: true,
                          fontSize: 9,
                          color: '#333333',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                        {
                          text: `BDT ${parseFloat(totalAmount).toFixed(2)}`,
                          fontSize: 11,
                          bold: true,
                          color: '#CC2027',
                          border: [false, false, false, true],
                          borderColor: [
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                            '#E0E0E0',
                          ],
                          margin: [8, 5, 8, 5],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0,
                  },
                  margin: [0, 0, 0, 0],
                },
              ],
            },

            // Right Column - QR Code & Important Info
            {
              width: '35%',
              stack: [
                // QR Code Section
                {
                  stack: [
                    {
                      image: qrDataUrl,
                      width: 130,
                      height: 130,
                      alignment: 'center',
                      margin: [0, 0, 0, 8],
                    },
                    {
                      text: 'SCAN AT ENTRANCE',
                      fontSize: 10,
                      bold: true,
                      alignment: 'center',
                      color: '#CC2027',
                      margin: [0, 0, 0, 3],
                    },
                    {
                      text: 'Present this QR code for verification',
                      fontSize: 8,
                      alignment: 'center',
                      color: '#666666',
                      margin: [0, 0, 0, 15],
                    },
                  ],
                  alignment: 'center',
                  margin: [0, 0, 0, 20],
                },

                // Ticket Information
                {
                  stack: [
                    {
                      text: 'TICKET INFORMATION',
                      fontSize: 10,
                      bold: true,
                      color: '#333333',
                      margin: [0, 0, 0, 8],
                    },
                    {
                      text: `Issue Date & Time: ${issueDate} ${issueTime}`,
                      fontSize: 8,
                      margin: [0, 0, 0, 3],
                    },
                    {
                      text: `Show Date & Time: ${journeyDate} ${showTime}`,
                      fontSize: 8,
                      margin: [0, 0, 0, 8],
                    },
                  ],
                  margin: [0, 0, 0, 15],
                },

                // Important Instructions
                {
                  stack: [
                    {
                      text: 'IMPORTANT NOTES',
                      fontSize: 10,
                      bold: true,
                      color: '#CC2027',
                      margin: [0, 0, 0, 8],
                    },
                    {
                      ul: [
                        'Arrive 30 minutes before showtime',
                        'Bring valid photo identity card',
                        'This ticket is non-transferable',
                        'Keep ticket safe and secure',
                        'No outside food allowed',
                        'Follow theater staff instructions',
                      ],
                      fontSize: 8,
                      color: '#666666',
                      lineHeight: 1.2,
                    },
                  ],
                  margin: [0, 0, 0, 0],
                },
              ],
            },
          ],
          columnGap: 15,
        },

        // Footer Section
        {
          stack: [
            {
              canvas: [
                { type: 'rect', x: 0, y: 0, w: 555, h: 1, color: '#E0E0E0' },
              ],
              margin: [0, 25, 0, 12],
            },
            {
              text: '(*) This e-ticket will be valid on production of Photo Identity Card of the passenger.',
              fontSize: 8,
              color: '#666666',
              margin: [0, 0, 0, 5],
            },
            {
              text: "(*) If you purchased e-ticket for your own travel, digital copy is sufficient to enter. You don't need to print out any hard copy.",
              fontSize: 8,
              color: '#666666',
              margin: [0, 0, 0, 5],
            },
            {
              text: 'Please keep your ticket in a safe place and DO NOT share it with anybody. VibePass and/or its affiliates will not be responsible for misused tickets.',
              fontSize: 8,
              color: '#666666',
              italics: true,
              margin: [0, 0, 0, 8],
            },
            {
              text: 'Hope you have a pleasant and enjoyable movie experience with VibePass!',
              fontSize: 9,
              color: '#333333',
              bold: true,
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                {
                  text: 'For assistance, contact: vibepass.helpdesk@gmail.com',
                  fontSize: 8,
                  color: '#666666',
                },
                {
                  text: `${frontendUrl}`,
                  fontSize: 8,
                  color: '#CC2027',
                  bold: true,
                  alignment: 'right',
                },
              ],
              margin: [0, 5, 0, 0],
            },
          ],
        },
      ],
    }

    // Generate PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    let chunks = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))
    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks)

      // Set headers for direct download
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="VibePass-Ticket-${transactionId}.pdf"`
      )
      res.setHeader('Content-Length', result.length)
      res.setHeader('Cache-Control', 'no-cache')

      res.send(result)
    })
    pdfDoc.end()
  } catch (err) {
    console.error('PDF generation error:', err)
    res.status(500).json({
      success: false,
      error: 'Failed to generate ticket. Please try again.',
    })
  }
})

module.exports = router
