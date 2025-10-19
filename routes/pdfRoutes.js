const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const PdfPrinter = require("pdfmake/src/printer");

// Fonts for pdfmake
const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

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

    // Generate QR code as DataURL
    const qrData = {
      // movieTitle,
      // theaterName,
      // showDate,
      // showTime,
      // selectedSeats,
      // totalAmount,
      // transactionId,
      status,
      userEmail,
      userName,
      // screen,
      // timestamp: new Date().toISOString(),
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: "H",
      margin: 3,
      width: 150,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Format date for display
    const formattedDate = new Date(showDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // PDF document definition
    const docDefinition = {
      pageSize: "A4",
      pageMargins: [35, 50, 35, 50],
      defaultStyle: {
        font: "Helvetica",
        fontSize: 10,
        lineHeight: 1.3,
      },
      header: (currentPage, pageCount) => [
        {
          // canvas: [
          //   { type: "rect", x: 0, y: 0, w: 595, h: 25, color: "#CC2027" },
          // ],
        },
        // {
        //   table: {
        //     widths: ["*"],
        //     body: [
        //       [
        //         {
        //           text: "VIBE-PASS ",
        //           fontSize: 14,
        //           color: "#FFFFFF",
        //           bold: true,
        //           alignment: "center",
        //           fillColor: "#CC2027",
        //           margin: [15, 8, 15, 8],
        //         },
        //       ],
        //     ],
        //   },
        //   layout: "noBorders",
        //   margin: [0, -20, 0, 0],
        // },
      ],
      footer: (currentPage, pageCount) => [
        {
          canvas: [
            { type: "rect", x: 0, y: 0, w: 595, h: 20, color: "#f8f9fa" },
          ],
        },
        {
          columns: [
            {
              text: `Transaction ID: ${transactionId}`,
              fontSize: 8,
              color: "#666666",
            },
            {
              text: `Generated on ${new Date().toLocaleDateString()}`,
              fontSize: 8,
              color: "#666666",
              alignment: "center",
            },
            {
              text: `Page ${currentPage} of ${pageCount}`,
              fontSize: 8,
              color: "#666666",
              alignment: "right",
            },
          ],
          margin: [35, 5, 35, 0],
        },
      ],
      content: [
        // Main Ticket Header
        {
          stack: [
            {
              text: "VIBEPASS MOVIE TICKET",
              fontSize: 20,
              bold: true,
              color: "#CC2027",
              alignment: "center",
              margin: [0, 0, 0, 5],
            },
            
          ],
        },

        // Columns: Left - Info, Right - QR
        {
          columns: [
            {
              width: "85%",
              stack: [
                {
                  text: `Dear ${userName || "Valued Customer"},`,
                  fontSize: 12,
                  bold: true,
                  color: "#333333",
                  margin: [0, 0, 0, 8],
                },
                {
                  text: "Thank you for choosing VibePass! Your booking has been successfully confirmed. We look forward to providing you with an exceptional cinematic experience. Please keep this ticket secure and do not share it with anyone.",
                  fontSize: 10,
                  color: "#555555",
                  margin: [0, 0, 0, 15],
                },
                
                {
                  table: {
                    widths: ["30%", "70%"],
                    body: [
                      // Header Row
      
                      [
                        {
                          text: "MOVIE INFORMATION",
                          colSpan: 2,
                          bold: true,
                          fontSize: 10,
                          color: "#CC2027",
                          fillColor: "#f8f9fa",
                          margin: [0, 6, 0, 6],
                          border: [false, false, false, true],
                          borderColor: "#E0E0E0",
                          borderLineWidth: 1,
                        },
                        {},
                      ],
                      [
                        {
                          text: "MOVIE TITLE",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: movieTitle,
                          fontSize: 10,
                          bold: true,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],
                      [
                        {
                          text: "THEATER",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: theaterName,
                          fontSize: 10,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],
                      [
                        {
                          text: "SCREEN",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: screen || "Main Hall",
                          fontSize: 10,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],

                      // Show Details Section
                      [
                        {
                          text: "SHOW DETAILS",
                          colSpan: 2,
                          bold: true,
                          fontSize: 10,
                          color: "#CC2027",
                          fillColor: "#f8f9fa",
                          margin: [0, 6, 0, 6],
                          border: [false, false, false, true],
                          borderColor: "#E0E0E0",
                          borderLineWidth: 1,
                        },
                        {},
                      ],
                      [
                        {
                          text: "DATE",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: formattedDate,
                          fontSize: 10,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],
                      [
                        {
                          text: "TIME",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: showTime,
                          fontSize: 10,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],
                      [
                        {
                          text: "SEATS",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: selectedSeats.join(", "),
                          fontSize: 10,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],

                      // Customer Information Section
                      [
                        {
                          text: "CUSTOMER INFORMATION",
                          colSpan: 2,
                          bold: true,
                          fontSize: 10,
                          color: "#CC2027",
                          fillColor: "#f8f9fa",
                          margin: [0, 6, 0, 6],
                          border: [false, false, false, true],
                          borderColor: "#E0E0E0",
                          borderLineWidth: 1,
                        },
                        {},
                      ],
                      [
                        {
                          text: "CUSTOMER NAME",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: userName || "Guest",
                          fontSize: 10,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],
                      [
                        {
                          text: "EMAIL",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: userEmail,
                          fontSize: 10,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],

                      // Payment Information Section
                      [
                        {
                          text: "PAYMENT INFORMATION",
                          colSpan: 2,
                          bold: true,
                          fontSize: 10,
                          color: "#CC2027",
                          fillColor: "#f8f9fa",
                          margin: [0, 6, 0, 6],
                          border: [false, false, false, true],
                          borderColor: "#E0E0E0",
                          borderLineWidth: 1,
                        },
                        {},
                      ],
                      [
                        {
                          text: "TRANSACTION ID",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: transactionId,
                          fontSize: 9,
                          color: "#333333",
                          border: [false, false, false, false],
                        },
                      ],
                      [
                        {
                          text: "STATUS",
                          bold: true,
                          fontSize: 9,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: status.toUpperCase(),
                          fontSize: 10,
                          bold: true,
                          color:
                            status.toLowerCase() === "paid"
                              ? "#000000"
                              : "#D32F2F",
                          border: [false, false, false, false],
                        },
                      ],
                      [
                        {
                          text: "AMOUNT PAID",
                          bold: true,
                          fontSize: 10,
                          color: "#666666",
                          border: [false, false, false, false],
                        },
                        {
                          text: ` ${parseFloat(totalAmount).toLocaleString()}`,
                          fontSize: 12,
                          bold: true,
                          color: "rgba(0, 0, 0, 1)",
                          border: [false, false, false, false],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      // No horizontal lines between regular rows, only section separators
                      return 0;
                    },
                    vLineWidth: () => 0,
                    hLineColor: () => "#E0E0E0",
                    vLineColor: () => "#E0E0E0",
                    paddingLeft: () => 10,
                    paddingRight: () => 10,
                    paddingTop: (i, node) => {
                      // More padding for section headers
                      if (i === 0 || [1, 5, 9, 13].includes(i)) return 8;
                      return 6;
                    },
                    paddingBottom: (i, node) => {
                      // More padding for section headers
                      if (i === 0 || [1, 5, 9, 13].includes(i)) return 8;
                      return 6;
                    },
                  },
                  margin: [0, 0, 0, 20],
                },
              ],
            },
            {
              width: "15%",
              stack: [
                {
                  image: qrDataUrl,
                  width: 90,
                  alignment: "center",
                  margin: [0, 0, 0, 8],
                },
                {
                  text: "Scan at entrance",
                  fontSize: 8,
                  alignment: "center",
                  color: "#666666",
                },
              ],
              alignment: "center",
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 20],
        },

        // Theater Guidelines
        {
          stack: [
            {
              text: "THEATER GUIDELINES",
              fontSize: 13,
              bold: true,
              color: "#CC2027",
              margin: [0, 0, 0, 12],
            },
            {
              columns: [
                {
                  width: "48%",
                  stack: [
                    {
                      text: "Please arrive 30 minutes before showtime",
                      fontSize: 9,
                      margin: [0, 0, 0, 6],
                    },
                    {
                      text: "Bring valid ID matching booking name",
                      fontSize: 9,
                      margin: [0, 0, 0, 6],
                    },
                    {
                      text: "Non-transferable & non-refundable",
                      fontSize: 9,
                      margin: [0, 0, 0, 6],
                    },
                  ],
                },
                {
                  width: "48%",
                  stack: [
                    {
                      text: "Children under 3 enter free (no seat)",
                      fontSize: 9,
                      margin: [0, 0, 0, 6],
                    },
                    {
                      text: "Late entry during intermission only",
                      fontSize: 9,
                      margin: [0, 0, 0, 6],
                    },
                    {
                      text: "Recording devices prohibited",
                      fontSize: 9,
                      margin: [0, 0, 0, 6],
                    },
                  ],
                },
              ],
            },
          ],
          margin: [0, 0, 0, 25],
        },

        // Final Note
        {
          stack: [
            {
              canvas: [
                { type: "rect", x: 0, y: 0, w: 525, h: 1, color: "#E0E0E0" },
              ],
            },
            {
              text: "Enjoy Your Movie Experience!",
              fontSize: 11,
              bold: true,
              alignment: "center",
              color: "#CC2027",
              margin: [0, 15, 0, 8],
            },
            {
              text: "For assistance, contact support@vibepass.com or call +8801311-035838",
              fontSize: 9,
              alignment: "center",
              color: "#666666",
              margin: [0, 0, 0, 5],
            },
          ],
        },
      ],
      styles: {
        totalAmount: { bold: true, color: "#CC2027", fontSize: 11 },
      },
      background: [
        {
          canvas: [
            { type: "rect", x: 0, y: 0, w: 595, h: 842, color: "#FFFFFF" },
          ],
        },
      ],
    };

    // Generate PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    let chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const result = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="VibePass-Ticket-${transactionId}.pdf"`
      );
      res.send(result);
    });
    pdfDoc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate ticket. Please try again.",
    });
  }
});

module.exports = router;





