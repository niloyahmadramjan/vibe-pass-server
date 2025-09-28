const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const QRCode = require("qrcode");

router.post("/", async (req, res) => {
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
    } = req.body;

    // Generate QR code as base64 image
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({ transactionId, status })
    );

    // Professional HTML ticket
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; margin:0; padding:0; background: #f5f5f5; }
            .ticket {
              width: 700px;
              margin: 50px auto;
              background: white;
              border-radius: 15px;
              padding: 30px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            }
            .header { text-align: center; color: #CC2027; }
            .header h1 { margin-bottom: 5px; }
            .section { margin: 20px 0; }
            .section h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .qr { text-align: center; margin-top: 20px; }
            .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>VibePass Ticket</h1>
              <p>Present at theater entrance</p>
            </div>

            <div class="section">
              <h2>Show Info</h2>
              <div class="details"><span>Movie:</span> <span>${movieTitle}</span></div>
              <div class="details"><span>Theater:</span> <span>${theaterName}</span></div>
              <div class="details"><span>Screen:</span> <span>${screen}</span></div>
              <div class="details"><span>Date:</span> <span>${showDate}</span></div>
              <div class="details"><span>Time:</span> <span>${showTime}</span></div>
              <div class="details"><span>Seats:</span> <span>${selectedSeats.join(
                ", "
              )}</span></div>
            </div>

            <div class="section">
              <h2>Booking Info</h2>
              <div class="details"><span>Name:</span> <span>${userName}</span></div>
              <div class="details"><span>Email:</span> <span>${userEmail}</span></div>
              <div class="details"><span>Transaction ID:</span> <span>${transactionId}</span></div>
              <div class="details"><span>Status:</span> <span>${status}</span></div>
              <div class="details"><span>Total Paid:</span> <span>৳${totalAmount}</span></div>
            </div>

            <div class="qr">
              <img src="${qrDataUrl}" width="180" height="180" />
              <p>Scan QR code at entrance</p>
            </div>

            <div class="footer">
              Arrive 30 minutes early. Bring a valid ID matching booking name.
            </div>
          </div>
        </body>
      </html>
    `;

    // Puppeteer PDF
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${transactionId}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
