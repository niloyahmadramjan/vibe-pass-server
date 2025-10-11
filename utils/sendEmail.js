const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, otp, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password recommended
      },
    })

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 12px; border: 1px solid #ddd;">
        <h2 style="text-align:center; color:#4A3AFF;">🎟️ VibePass Verification</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          Use the following OTP to verify your email for <strong>VibePass</strong>. 
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <div style="margin: 20px auto; text-align: center;">
          <div style="display:inline-block; padding: 15px 30px; font-size: 28px; font-weight: bold; color: #4A3AFF; background: #fff; border: 2px dashed #4A3AFF; border-radius: 10px;">
            ${otp}
          </div>
        </div>

        <p style="text-align:center; font-size:14px; color:#666;">
           Tap & hold (mobile) or double-click (desktop) to copy your OTP.
        </p>

        <div style="margin-top:30px; padding:15px; background:#f0f0f0; border-radius:8px; font-size:14px; color:#555;">
          If you did not request this, you can safely ignore this email.
        </div>

        <p style="margin-top:20px; text-align:center; font-size:13px; color:#aaa;">
          &copy; ${new Date().getFullYear()} VibePass. All rights reserved.
        </p>
      </div>
    `

    await transporter.sendMail({
      from: `"VibePass" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    })

    // console.log('✅ Email sent to', to)
  } catch (err) {
    console.error('❌ Email error:', err.message)
    throw new Error('Email not sent')
  }
}

module.exports = sendEmail
