const express = require('express')
const router = express.Router()
const QRCode = require('qrcode')

// 🔄 Step 1: puppeteer এর জায়গায় এই ২টা ব্যবহার করো
const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

router.post('/', async (req, res) => {
  try {
    const {
      movieTitle,
      theaterName,
      showDate,
      showTime,
      selectedSeats,
      totalAmount,
      transactionId,
      status,
      userEmail,
      userName,
      screen,
    } = req.body

    // ✅ Generate QR Code with ALL ticket info
    const qrData = {
      movieTitle,
      theaterName,
      showDate,
      showTime,
      selectedSeats,
      totalAmount,
      transactionId,
      status,
      userEmail,
      userName,
      screen,
    }

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData))

    // ✅ Professional Ticket HTML
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f4f6f9;
              margin: 0;
              padding: 20px;
            }
            .ticket {
              max-width: 750px;
              margin: auto;
              background: #fff;
              border-radius: 16px;
              box-shadow: 0 8px 30px rgba(0,0,0,0.1);
              overflow: hidden;
              border: 2px solid #CC2027;
            }
            .header {
              background: #CC2027;
              color: #fff;
              text-align: center;
              padding: 20px 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .section {
              padding: 20px 30px;
              border-bottom: 1px solid #eee;
            }
            .section h2 {
              margin: 0 0 15px;
              font-size: 18px;
              color: #CC2027;
              border-left: 4px solid #CC2027;
              padding-left: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              width: 160px;
              text-align: left;
              padding: 8px;
              color: #555;
              font-weight: 600;
              background: #fafafa;
              border-bottom: 1px solid #eee;
            }
            td {
              padding: 8px;
              font-size: 14px;
              color: #333;
              border-bottom: 1px solid #eee;
            }
            .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: bold;
              color: #fff;
              background: ${status === 'paid' ? '#28a745' : '#dc3545'};
            }
            .qr {
              text-align: center;
              padding: 25px;
            }
            .qr img {
              border: 6px solid #f4f4f4;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .qr p {
              margin-top: 10px;
              font-size: 13px;
              color: #444;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              padding: 15px 20px;
              background: #fafafa;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>🎟️ VibePass Ticket</h1>
              <p>Present this ticket at the theater entrance</p>
            </div>

            <div class="section">
              <h2>Show Information</h2>
              <table>
                <tr><th>Movie</th><td>${movieTitle}</td></tr>
                <tr><th>Theater</th><td>${theaterName}</td></tr>
                <tr><th>Screen</th><td>${screen || 'N/A'}</td></tr>
                <tr><th>Date</th><td>${showDate}</td></tr>
                <tr><th>Time</th><td>${showTime}</td></tr>
                <tr><th>Seats</th><td>${selectedSeats.join(', ')}</td></tr>
              </table>
            </div>

            <div class="section">
              <h2>Booking Information</h2>
              <table>
                <tr><th>Name</th><td>${userName || 'N/A'}</td></tr>
                <tr><th>Email</th><td>${userEmail}</td></tr>
                <tr><th>Transaction ID</th><td>${transactionId}</td></tr>
                <tr><th>Status</th><td><span class="badge">${status}</span></td></tr>
                <tr><th>Total Paid</th><td style="font-weight:bold; color:#CC2027;">৳${totalAmount}</td></tr>
              </table>
            </div>

            <div class="qr">
              <img src="${qrDataUrl}" width="180" height="180" />
              <p>Scan QR code to verify ticket details</p>
            </div>

            <div class="footer">
              ⚠️ Please arrive at least 30 minutes before showtime.<br/>
              Bring a valid ID matching the booking name.
            </div>
          </div>
        </body>
      </html>
    `

    const executablePath =
      (await chromium.executablePath) || '/usr/bin/google-chrome' // ✅ লোকাল dev এর জন্য fallback

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    })



    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    })

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ticket-${transactionId}.pdf`
    )
    res.send(pdfBuffer)
  } catch (err) {
    console.error('PDF generation error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
