const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use custom SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"VibePass" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    })
  } catch (err) {
    console.error('❌ Email error:', err.message)
    throw new Error('Email not sent')
  }
}
module.exports = sendEmail;
