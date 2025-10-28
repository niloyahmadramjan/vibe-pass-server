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
        const { subject, message, region } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject and message are required"
            });
        }

        // Build query based on region
        let query = {};
        if (region && region !== 'All Regions') {
            query.region = region;
        }

        const subscribers = await Subscriber.find(query).select('email');
        const subscriberEmails = subscribers.map(sub => sub.email);

        if (subscriberEmails.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No subscribers found" + (region && region !== 'All Regions' ? ` in ${region} region` : '')
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a0b0b 0%, #2d1a1a 50%, #3a1f1f 100%);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background: linear-gradient(135deg, #2a1515 0%, #3a1f1f 100%);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(220, 53, 69, 0.15);
            border: 1px solid #5a2a2a;
            position: relative;
        }
        
        .email-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #dc3545, #ff6b6b, #dc3545);
            z-index: 10;
        }
        
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 50%, #a71e2a 100%);
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            animation: float 20s linear infinite;
        }
        
        @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(-20px, -20px) rotate(360deg); }
        }
        
        .logo {
            font-size: 42px;
            font-weight: 800;
            color: white;
            margin-bottom: 12px;
            letter-spacing: -1px;
            position: relative;
            z-index: 2;
            text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .logo-subtitle {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;
            letter-spacing: 3px;
            text-transform: uppercase;
            position: relative;
            z-index: 2;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .content {
            padding: 60px 50px;
            background: transparent;
            position: relative;
        }
        
        .announcement-title {
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 30px;
            line-height: 1.3;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .message-box {
            background: linear-gradient(135deg, #3a1f1f 0%, #4a2a2a 100%);
            border: 1px solid #6a3a3a;
            padding: 45px;
            border-radius: 20px;
            margin: 35px 0;
            box-shadow: 0 12px 40px rgba(220, 53, 69, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .message-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 6px;
            height: 100%;
            background: linear-gradient(180deg, #dc3545, #ff6b6b);
        }
        
        .message-content {
            font-size: 17px;
            line-height: 1.8;
            color: #f8f9fa;
            white-space: pre-line;
            text-align: left;
            position: relative;
            z-index: 2;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 18px 45px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            font-size: 17px;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .cta-button:hover::before {
            left: 100%;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(220, 53, 69, 0.6);
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .feature {
            text-align: center;
            padding: 25px 15px;
            background: linear-gradient(135deg, #3a1f1f 0%, #4a2a2a 100%);
            border-radius: 16px;
            border: 1px solid #6a3a3a;
        }
        
        .feature-icon {
            font-size: 24px;
            color: #dc3545;
            margin-bottom: 12px;
        }
        
        .feature-text {
            font-size: 14px;
            color: #e9ecef;
            font-weight: 500;
        }
        
        .footer {
            background: linear-gradient(135deg, #1a0b0b 0%, #2d1a1a 100%);
            color: #ced4da;
            padding: 50px 40px;
            text-align: center;
            border-top: 1px solid #5a2a2a;
            position: relative;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, #dc3545, #ff6b6b, #dc3545);
            border-radius: 0 0 10px 10px;
        }
        
        .company-info {
            font-size: 15px;
            color: #f8f9fa;
            margin: 20px 0;
            line-height: 1.6;
        }
        
        .unsubscribe {
            font-size: 13px;
            color: #adb5bd;
            margin-top: 30px;
            line-height: 1.6;
            padding: 20px;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(220, 53, 69, 0.2);
        }
        
        .unsubscribe a {
            color: #ff6b6b;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }
        
        .unsubscribe a:hover {
            color: #ff8787;
        }
        
        .copyright {
            font-size: 12px;
            color: #6c757d;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #5a2a2a;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .header {
                padding: 40px 25px;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .announcement-title {
                font-size: 26px;
            }
            
            .message-box {
                padding: 30px 25px;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
            
            .logo {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🔥 VibePass</div>
            <div class="logo-subtitle">Premium Cinema Experience</div>
            <div class="badge">Exclusive Announcement</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h1 class="announcement-title">${subject}</h1>
            
            <div class="message-box">
                <div class="message-content">${message}</div>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🎬</div>
                    <div class="feature-text">Latest Movies</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-text">Premium Seats</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎭</div>
                    <div class="feature-text">Special Events</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">💫</div>
                    <div class="feature-text">VIP Access</div>
                </div>
            </div>
            
            <div class="cta-section">
                <a href="https://vibe-pass-8z9z.onrender.com/" class="cta-button">
                    🎉 Explore Now & Get Premium Access
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="company-info">
                <strong>VibePass Entertainment Ltd.</strong><br>
                Creating unforgettable cinema moments
            </div>
            
            <div class="unsubscribe">
                You're receiving this exclusive update because you subscribed to VibePass.<br>
                <a href="https://vibe-pass-8z9z.onrender.com/unsubscribe">Unsubscribe instantly</a> • 
                <a href="https://vibe-pass-8z9z.onrender.com/preferences">Manage preferences</a>
            </div>
            
            <div class="copyright">
                &copy; 2025 VibePass. Crafting cinematic excellence. All rights reserved. ✨
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
            message: `Announcement sent successfully to ${subscriberEmails.length} subscribers${region && region !== 'All Regions' ? ` in ${region}` : ''}`,
            data: {
                recipients: subscriberEmails.length,
                region: region || 'All Regions'
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