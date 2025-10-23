const Subscriber = require("../models/Subscriber");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendAnnouncement = async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject and message are required"
            });
        }

        const subscribers = await Subscriber.find().select('email');
        const subscriberEmails = subscribers.map(sub => sub.email);

        if (subscriberEmails.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No subscribers found"
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            bcc: subscriberEmails,
            subject: subject,
            text: message,
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                    border: 1px solid #33334d;
                }
                
                .header {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    padding: 50px 30px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .header::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.1"><circle cx="20" cy="20" r="2" fill="white"/><circle cx="80" cy="30" r="1.5" fill="white"/><circle cx="40" cy="70" r="1" fill="white"/><circle cx="70" cy="80" r="1.2" fill="white"/></svg>');
                }
                
                .logo {
                    font-size: 36px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                    position: relative;
                    z-index: 2;
                }
                
                .logo-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 400;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    position: relative;
                    z-index: 2;
                }
                
                .content {
                    padding: 50px 40px;
                    background: transparent;
                }
                
                .announcement-title {
                    font-size: 28px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 25px;
                    line-height: 1.3;
                    text-align: center;
                }
                
                .message-box {
                    background: linear-gradient(135deg, #2a2a3e 0%, #34344a 100%);
                    border: 1px solid #44445a;
                    padding: 35px;
                    border-radius: 16px;
                    margin: 30px 0;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }
                
                .message-content {
                    font-size: 16px;
                    line-height: 1.7;
                    color: #e2e8f0;
                    white-space: pre-line;
                    text-align: center;
                }
                
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    color: white;
                    padding: 16px 40px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 25px 0;
                    transition: all 0.3s ease;
                    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
                    border: none;
                    cursor: pointer;
                }
                
                .footer {
                    background: linear-gradient(135deg, #151525 0%, #1a1a2e 100%);
                    color: #a0aec0;
                    padding: 40px 30px;
                    text-align: center;
                    border-top: 1px solid #33334d;
                }
                
                .unsubscribe {
                    font-size: 12px;
                    color: #718096;
                    margin-top: 25px;
                    line-height: 1.6;
                }
                
                .unsubscribe a {
                    color: #ff6b6b;
                    text-decoration: none;
                }
                
                @media (max-width: 600px) {
                    body {
                        padding: 10px;
                    }
                    
                    .header {
                        padding: 40px 20px;
                    }
                    
                    .content {
                        padding: 40px 25px;
                    }
                    
                    .announcement-title {
                        fontSize: 24px;
                    }
                    
                    .message-box {
                        padding: 25px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <!-- Header -->
                <div class="header">
                    <div class="logo">VibePass</div>
                    <div class="logo-subtitle">Premium Cinema Experience</div>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <h1 class="announcement-title">${subject}</h1>
                    
                    <div class="message-box">
                        <div class="message-content">${message}</div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="https://vibe-pass-8z9z.onrender.com/" class="cta-button">
                            Discover Movies & Events 
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <div style="font-size: 14px; color: #e2e8f0; margin: 15px 0;">
                        VibePass Entertainment Ltd.<br>
                        Bringing you the best cinema experience
                    </div>
                    
                    <div class="unsubscribe">
                        You're receiving this because you subscribed to VibePass updates.<br>
                        <a href="https://vibe-pass-8z9z.onrender.com/unsubscribe">Unsubscribe</a> • 
                        <a href="https://vibe-pass-8z9z.onrender.com/preferences">Preferences</a>
                    </div>
                    
                    <div style="font-size: 12px; color: #4a5568; margin-top: 25px;">
                        &copy; 2025 VibePass. All magic reserved. ✨
                    </div>
                </div>
            </div>
        </body>
        </html>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: `Announcement sent successfully to ${subscriberEmails.length} subscribers`,
            data: {
                recipients: subscriberEmails.length
            }
        });

    } catch (error) {
        console.error('Error sending announcement:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to send announcement",
            error: error.message
        });
    }
}

module.exports = {
    sendAnnouncement
};