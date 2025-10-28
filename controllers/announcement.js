// controllers/announcement.js
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

        // Region mapping - Frontend vs Database
        const regionMapping = {
            'Dhaka': 'Dhaka Division',
            'Chittagong': 'Chittagong Division',
            'Rajshahi': 'Rajshahi Division',
            'Khulna': 'Khulna Division',
            'Barisal': 'Barisal Division',
            'Sylhet': 'Sylhet Division',
            'Rangpur': 'Rangpur Division',
            'Mymensingh': 'Mymensingh Division'
        };

        // Build query based on region
        let query = {};
        let targetRegion = 'All Regions';

        if (region && region !== 'All Regions') {
            // Map frontend region to database region
            const databaseRegion = regionMapping[region] || region;
            query.region = databaseRegion;
            targetRegion = region;

           
        } else {
            console.log(`🌍 Sending to all regions`);
        }

        const subscribers = await Subscriber.find(query).select('email region');
        console.log(`find ${subscribers.length} subscribers for query:`, query);

        // Log actual regions found for debugging
        const regionsFound = [...new Set(subscribers.map(sub => sub.region))];
        console.log('📍 Regions found in database:', regionsFound);

        const subscriberEmails = subscribers.map(sub => sub.email);

        if (subscriberEmails.length === 0) {
            return res.status(400).json({
                success: false,
                message: `No subscribers found${region && region !== 'All Regions' ? ` in ${region} region` : ''}`
            });
        }

        console.log(`✅ Will send to ${subscriberEmails.length} subscribers`);

        // Send email
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
        /* Basic Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background-color: #0f172a;
            margin: 0;
            padding: 20px;
            color: #ffffff;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e293b;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            padding: 40px 20px;
            text-align: center;
        }
        
        .logo {
            font-size: 36px;
            font-weight: bold;
            color: white;
            margin-bottom: 8px;
        }
        
        .logo-subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        
        .region-chip {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .announcement-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .announcement-title {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10px;
        }
        
        .announcement-subtitle {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 15px;
        }
        
        .delivery-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .message-card {
            background-color: #334155;
            padding: 30px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #dc2626;
        }
        
        .message-content {
            font-size: 16px;
            line-height: 1.6;
            color: #e2e8f0;
            white-space: pre-line;
        }
        
        .ticket-system {
            background-color: #334155;
            padding: 30px;
            border-radius: 8px;
            margin: 25px 0;
        }
        
        .ticket-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .ticket-title {
            font-size: 22px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
        }
        
        .ticket-subtitle {
            font-size: 14px;
            color: #cbd5e1;
        }
        
        .ticket-features {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        
        .ticket-feature {
            display: table-cell;
            text-align: center;
            padding: 15px 10px;
            vertical-align: top;
        }
        
        .ticket-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
        }
        
        .ticket-feature-title {
            font-size: 14px;
            color: #ffffff;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .ticket-feature-desc {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.4;
        }
        
        .highlights {
            margin: 30px 0;
        }
        
        .highlight-item {
            background-color: #475569;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            text-align: center;
            border-left: 3px solid #dc2626;
        }
        
        .highlight-icon {
            font-size: 24px;
            margin-bottom: 10px;
            display: block;
        }
        
        .highlight-title {
            font-size: 16px;
            color: #ffffff;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .highlight-desc {
            font-size: 13px;
            color: #cbd5e1;
            line-height: 1.4;
        }
        
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            border: none;
        }
        
        .footer {
            background-color: #0f172a;
            color: #94a3b8;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #334155;
        }
        
        .company-name {
            font-size: 16px;
            color: #ffffff;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .company-tagline {
            font-size: 13px;
            color: #cbd5e1;
            margin-bottom: 20px;
        }
        
        .legal-section {
            font-size: 12px;
            color: #64748b;
            margin-top: 20px;
            padding: 15px;
            background-color: #1e293b;
            border-radius: 6px;
        }
        
        .legal-links {
            margin-top: 10px;
        }
        
        .legal-links a {
            color: #f87171;
            text-decoration: none;
            margin: 0 8px;
        }
        
        .copyright {
            font-size: 11px;
            color: #475569;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #334155;
        }
        
        /* Mobile Responsive */
        @media (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            
            .announcement-title {
                font-size: 24px;
            }
            
            .ticket-feature {
                display: block;
                margin-bottom: 15px;
            }
            
            .highlight-item {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🔥 VibePass</div>
            <div class="logo-subtitle">Digital Cinema Experience</div>
            <div class="region-chip">
                ${targetRegion !== 'All Regions' ? `${targetRegion} Exclusive` : 'Global Announcement'}
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="announcement-header">
                <h1 class="announcement-title">${subject}</h1>
                <div class="announcement-subtitle">Instant Delivery • Digital Tickets • Real-time Updates</div>
                <div class="delivery-badge">
                    ⚡ Real-time Email Delivery Active
                </div>
            </div>
            
            <div class="message-card">
                <div class="message-content">${message}</div>
            </div>

            <!-- Digital Ticket System -->
            <div class="ticket-system">
                <div class="ticket-header">
                    <h2 class="ticket-title">🎫 Digital Ticket System</h2>
                    <p class="ticket-subtitle">Instant access, zero hassle - Your tickets are just a click away!</p>
                </div>
                
                <div class="ticket-features">
                    <div class="ticket-feature">
                        <div class="ticket-icon">📱</div>
                        <div class="ticket-feature-title">Mobile Tickets</div>
                        <div class="ticket-feature-desc">Access tickets on any device</div>
                    </div>
                    <div class="ticket-feature">
                        <div class="ticket-icon">⚡</div>
                        <div class="ticket-feature-title">Instant Delivery</div>
                        <div class="ticket-feature-desc">No delays, receive immediately</div>
                    </div>
                    <div class="ticket-feature">
                        <div class="ticket-icon">🔄</div>
                        <div class="ticket-feature-title">Easy Transfers</div>
                        <div class="ticket-feature-desc">Share with one click</div>
                    </div>
                    <div class="ticket-feature">
                        <div class="ticket-icon">🛡️</div>
                        <div class="ticket-feature-title">Secure & Safe</div>
                        <div class="ticket-feature-desc">Encrypted QR codes</div>
                    </div>
                </div>
            </div>
            
            <!-- Highlights -->
            <div class="highlights">
                <div class="highlight-item">
                    <div class="highlight-icon">🌟</div>
                    <div class="highlight-title">Exclusive Premieres</div>
                    <div class="highlight-desc">First access to blockbuster movies</div>
                </div>
                <div class="highlight-item">
                    <div class="highlight-icon">💎</div>
                    <div class="highlight-title">VIP Treatment</div>
                    <div class="highlight-desc">Luxury seating & personalized service</div>
                </div>
                <div class="highlight-item">
                    <div class="highlight-icon">🎪</div>
                    <div class="highlight-title">Live Events</div>
                    <div class="highlight-desc">Special screenings with celebrities</div>
                </div>
                <div class="highlight-item">
                    <div class="highlight-icon">⚡</div>
                    <div class="highlight-title">Priority Access</div>
                    <div class="highlight-desc">Early booking & exclusive discounts</div>
                </div>
            </div>
            
            <!-- CTA -->
            <div class="cta-container">
                <a href="https://vibe-pass-8z9z.onrender.com/" class="cta-button">
                    🚀 Book Tickets Instantly 🎟️
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="company-name">VibePass Entertainment Ltd.</div>
            <div class="company-tagline">Redefining cinematic experiences with cutting-edge technology</div>
            
            <div class="legal-section">
                <strong>Why you're receiving this email:</strong><br>
                You're part of our exclusive VibePass community enjoying real-time updates and digital ticket benefits.
                <div class="legal-links">
                    <a href="https://vibe-pass-8z9z.onrender.com/unsubscribe">Unsubscribe</a> • 
                    <a href="https://vibe-pass-8z9z.onrender.com/preferences">Preferences</a> • 
                    <a href="https://vibe-pass-8z9z.onrender.com/support">Support</a>
                </div>
            </div>
            
            <div class="copyright">
                &copy; 2025 VibePass Entertainment Ltd. All rights reserved.<br>
                Powered by real-time technology. Delivering magic, instantly. ✨
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
            message: `Announcement sent successfully to ${subscriberEmails.length} subscribers${targetRegion !== 'All Regions' ? ` in ${targetRegion} region` : ''}`,
            data: {
                recipients: subscriberEmails.length,
                region: targetRegion
            }
        });

    } catch (error) {
        console.error('❌ Error sending announcement:', error);
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













// const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_USER,
//     bcc: subscriberEmails,
//     subject: subject,
//     text: message,
//     html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${subject}</title>
//     <style>
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//         }
        
//         body {
//             font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//             background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
//             margin: 0;
//             padding: 40px 20px;
//             min-height: 100vh;
//         }
        
//         .email-container {
//             max-width: 650px;
//             margin: 0 auto;
//             background: linear-gradient(165deg, #1e293b 0%, #0f172a 100%);
//             border-radius: 32px;
//             overflow: hidden;
//             box-shadow: 
//                 0 32px 64px rgba(0, 0, 0, 0.25),
//                 0 0 0 1px rgba(255, 255, 255, 0.05);
//             position: relative;
//         }
        
//         .email-container::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             height: 8px;
//             background: linear-gradient(90deg, 
//                 #f43f5e 0%, 
//                 #e11d48 25%, 
//                 #be123c 50%, 
//                 #e11d48 75%, 
//                 #f43f5e 100%);
//             z-index: 10;
//         }
        
//         .header {
//             background: linear-gradient(135deg, 
//                 #dc2626 0%, 
//                 #b91c1c 30%, 
//                 #991b1b 70%, 
//                 #7f1d1d 100%);
//             padding: 80px 50px 60px;
//             text-align: center;
//             position: relative;
//             overflow: hidden;
//         }
        
//         .header::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: 
//                 radial-gradient(circle at 10% 20%, rgba(255,255,255,0.15) 0%, transparent 40%),
//                 radial-gradient(circle at 90% 80%, rgba(255,255,255,0.1) 0%, transparent 40%),
//                 linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%);
//             animation: pulse 6s ease-in-out infinite;
//         }
        
//         @keyframes pulse {
//             0%, 100% { opacity: 0.3; }
//             50% { opacity: 0.6; }
//         }
        
//         .logo-wrapper {
//             position: relative;
//             z-index: 2;
//             margin-bottom: 20px;
//         }
        
//         .logo {
//             font-size: 56px;
//             font-weight: 900;
//             color: white;
//             margin-bottom: 12px;
//             letter-spacing: -2px;
//             text-shadow: 
//                 0 6px 24px rgba(0, 0, 0, 0.4),
//                 0 3px 8px rgba(0, 0, 0, 0.3);
//             background: linear-gradient(135deg, #ffffff 0%, #fecaca 100%);
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//             background-clip: text;
//         }
        
//         .logo-subtitle {
//             font-size: 15px;
//             color: rgba(255, 255, 255, 0.9);
//             font-weight: 600;
//             letter-spacing: 3px;
//             text-transform: uppercase;
//             text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
//             margin-bottom: 25px;
//         }
        
//         .region-chip {
//             display: inline-flex;
//             align-items: center;
//             gap: 8px;
//             background: linear-gradient(135deg, 
//                 rgba(255,255,255,0.2) 0%, 
//                 rgba(255,255,255,0.1) 100%);
//             color: white;
//             padding: 14px 32px;
//             border-radius: 50px;
//             font-size: 14px;
//             font-weight: 700;
//             letter-spacing: 0.5px;
//             backdrop-filter: blur(20px);
//             border: 1px solid rgba(255, 255, 255, 0.3);
//             box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
//             position: relative;
//             z-index: 2;
//         }
        
//         .content {
//             padding: 70px 50px;
//             background: transparent;
//         }
        
//         .announcement-header {
//             text-align: center;
//             margin-bottom: 50px;
//         }
        
//         .announcement-title {
//             font-size: 40px;
//             font-weight: 800;
//             color: #ffffff;
//             margin-bottom: 16px;
//             line-height: 1.2;
//             text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
//             background: linear-gradient(135deg, #ffffff 0%, #fca5a5 100%);
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//             background-clip: text;
//         }
        
//         .announcement-subtitle {
//             font-size: 18px;
//             color: #cbd5e1;
//             font-weight: 500;
//             opacity: 0.9;
//         }
        
//         .message-card {
//             background: linear-gradient(145deg, 
//                 rgba(30, 41, 59, 0.8) 0%, 
//                 rgba(15, 23, 42, 0.9) 100%);
//             border: 1px solid rgba(255, 255, 255, 0.08);
//             padding: 55px;
//             border-radius: 28px;
//             margin: 45px 0;
//             box-shadow: 
//                 0 24px 48px rgba(0, 0, 0, 0.4),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.1);
//             position: relative;
//             backdrop-filter: blur(15px);
//         }
        
//         .message-card::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 10px;
//             height: 100%;
//             background: linear-gradient(180deg, 
//                 #f87171 0%, 
//                 #ef4444 50%, 
//                 #dc2626 100%);
//             border-radius: 28px 0 0 28px;
//         }
        
//         .message-content {
//             font-size: 19px;
//             line-height: 1.8;
//             color: #e2e8f0;
//             white-space: pre-line;
//             text-align: center;
//             position: relative;
//             z-index: 2;
//             font-weight: 400;
//         }
        
//         .highlights {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
//             gap: 30px;
//             margin: 60px 0;
//         }
        
//         .highlight-item {
//             text-align: center;
//             padding: 40px 25px;
//             background: linear-gradient(145deg, 
//                 rgba(30, 41, 59, 0.6) 0%, 
//                 rgba(15, 23, 42, 0.8) 100%);
//             border-radius: 24px;
//             border: 1px solid rgba(255, 255, 255, 0.08);
//             transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//             position: relative;
//             overflow: hidden;
//         }
        
//         .highlight-item::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             height: 3px;
//             background: linear-gradient(90deg, 
//                 #f87171, 
//                 #ef4444, 
//                 #dc2626);
//         }
        
//         .highlight-item:hover {
//             transform: translateY(-8px) scale(1.02);
//             box-shadow: 
//                 0 20px 50px rgba(220, 38, 38, 0.25),
//                 0 0 0 1px rgba(220, 38, 38, 0.1);
//             border-color: rgba(220, 38, 38, 0.3);
//         }
        
//         .highlight-icon {
//             font-size: 40px;
//             margin-bottom: 20px;
//             display: block;
//             filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4));
//             animation: bounce 3s ease-in-out infinite;
//         }
        
//         @keyframes bounce {
//             0%, 100% { transform: translateY(0); }
//             50% { transform: translateY(-5px); }
//         }
        
//         .highlight-title {
//             font-size: 18px;
//             color: #ffffff;
//             font-weight: 700;
//             margin-bottom: 12px;
//         }
        
//         .highlight-desc {
//             font-size: 14px;
//             color: #94a3b8;
//             font-weight: 400;
//             line-height: 1.6;
//         }
        
//         .cta-container {
//             text-align: center;
//             margin: 60px 0 50px;
//         }
        
//         .cta-button {
//             display: inline-flex;
//             align-items: center;
//             gap: 16px;
//             background: linear-gradient(135deg, 
//                 #f87171 0%, 
//                 #ef4444 30%, 
//                 #dc2626 70%, 
//                 #b91c1c 100%);
//             color: white;
//             padding: 22px 55px;
//             text-decoration: none;
//             border-radius: 65px;
//             font-weight: 800;
//             font-size: 19px;
//             transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//             box-shadow: 
//                 0 15px 35px rgba(220, 38, 38, 0.5),
//                 0 0 0 0 rgba(220, 38, 38, 0.8);
//             border: none;
//             cursor: pointer;
//             position: relative;
//             overflow: hidden;
//             letter-spacing: 0.5px;
//         }
        
//         .cta-button::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: -100%;
//             width: 100%;
//             height: 100%;
//             background: linear-gradient(90deg, 
//                 transparent, 
//                 rgba(255, 255, 255, 0.4), 
//                 transparent);
//             transition: left 0.7s ease;
//         }
        
//         .cta-button:hover::before {
//             left: 100%;
//         }
        
//         .cta-button:hover {
//             transform: translateY(-4px) scale(1.05);
//             box-shadow: 
//                 0 20px 45px rgba(220, 38, 38, 0.7),
//                 0 0 0 12px rgba(220, 38, 38, 0.15);
//         }
        
//         .footer {
//             background: linear-gradient(135deg, 
//                 #0f172a 0%, 
//                 #1e293b 100%);
//             color: #94a3b8;
//             padding: 70px 50px;
//             text-align: center;
//             border-top: 1px solid rgba(255, 255, 255, 0.08);
//             position: relative;
//         }
        
//         .footer::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 50%;
//             transform: translateX(-50%);
//             width: 140px;
//             height: 5px;
//             background: linear-gradient(90deg, 
//                 #f87171, 
//                 #ef4444, 
//                 #dc2626, 
//                 #f87171);
//             border-radius: 0 0 10px 10px;
//         }
        
//         .brand-section {
//             margin-bottom: 35px;
//         }
        
//         .company-name {
//             font-size: 20px;
//             color: #ffffff;
//             font-weight: 700;
//             margin-bottom: 8px;
//         }
        
//         .company-tagline {
//             font-size: 15px;
//             color: #cbd5e1;
//             font-style: italic;
//             opacity: 0.8;
//         }
        
//         .legal-section {
//             font-size: 13px;
//             color: #64748b;
//             margin-top: 40px;
//             line-height: 1.6;
//             padding: 28px;
//             background: rgba(220, 38, 38, 0.05);
//             border-radius: 20px;
//             border: 1px solid rgba(220, 38, 38, 0.1);
//             backdrop-filter: blur(10px);
//         }
        
//         .legal-links {
//             margin-top: 16px;
//         }
        
//         .legal-links a {
//             color: #f87171;
//             text-decoration: none;
//             font-weight: 600;
//             transition: color 0.3s ease;
//             position: relative;
//             margin: 0 12px;
//         }
        
//         .legal-links a::after {
//             content: '';
//             position: absolute;
//             bottom: -2px;
//             left: 0;
//             width: 0;
//             height: 2px;
//             background: #f87171;
//             transition: width 0.3s ease;
//         }
        
//         .legal-links a:hover::after {
//             width: 100%;
//         }
        
//         .copyright {
//             font-size: 12px;
//             color: #475569;
//             margin-top: 35px;
//             padding-top: 30px;
//             border-top: 1px solid rgba(255, 255, 255, 0.05);
//             letter-spacing: 0.5px;
//         }
        
//         .floating-emoji {
//             animation: float 4s ease-in-out infinite;
//         }
        
//         @keyframes float {
//             0%, 100% { transform: translateY(0px) rotate(0deg); }
//             50% { transform: translateY(-10px) rotate(5deg); }
//         }
        
//         @media (max-width: 600px) {
//             body {
//                 padding: 20px 10px;
//             }
            
//             .header {
//                 padding: 60px 30px 45px;
//             }
            
//             .content {
//                 padding: 50px 30px;
//             }
            
//             .announcement-title {
//                 font-size: 32px;
//             }
            
//             .message-card {
//                 padding: 40px 30px;
//             }
            
//             .highlights {
//                 grid-template-columns: 1fr;
//                 gap: 25px;
//             }
            
//             .logo {
//                 font-size: 44px;
//             }
            
//             .cta-button {
//                 padding: 20px 40px;
//                 font-size: 17px;
//             }
//         }
//     </style>
// </head>
// <body>
//     <div class="email-container">
//         <!-- Header -->
//         <div class="header">
//             <div class="logo-wrapper">
//                 <div class="logo"> 🔥 VibePass</div>
//                 <div class="logo-subtitle">Elite Cinema Experience</div>
//             </div>
//             <div class="region-chip">
//                 <span class="floating-emoji">🎯</span>
//                 ${targetRegion !== 'All Regions' ? `${targetRegion} Exclusive` : 'Global Announcement'}
//             </div>
//         </div>
        
//         <!-- Content -->
//         <div class="content">
//             <div class="announcement-header">
//                 <h1 class="announcement-title">${subject}</h1>
//                 <div class="announcement-subtitle">Special Update for Our Valued Members</div>
//             </div>
            
//             <div class="message-card">
//                 <div class="message-content">${message}</div>
//             </div>
            
//             <div class="highlights">
//                 <div class="highlight-item">
//                     <div class="highlight-icon">🌟</div>
//                     <div class="highlight-title">Exclusive Premieres</div>
//                     <div class="highlight-desc">Be the first to experience blockbuster movies before anyone else</div>
//                 </div>
//                 <div class="highlight-item">
//                     <div class="highlight-icon">💎</div>
//                     <div class="highlight-title">VIP Treatment</div>
//                     <div class="highlight-desc">Luxury seating, gourmet snacks, and personalized service</div>
//                 </div>
//                 <div class="highlight-item">
//                     <div class="highlight-icon">🎪</div>
//                     <div class="highlight-title">Live Events</div>
//                     <div class="highlight-desc">Special screenings with cast appearances and director talks</div>
//                 </div>
//                 <div class="highlight-item">
//                     <div class="highlight-icon">⚡</div>
//                     <div class="highlight-title">Priority Access</div>
//                     <div class="highlight-desc">Early booking windows and exclusive member discounts</div>
//                 </div>
//             </div>
            
//             <div class="cta-container">
//                 <a href="https://vibe-pass-8z9z.onrender.com/" class="cta-button">
//                     <span class="floating-emoji">🎉</span>
//                     Unlock Premium Benefits
//                     <span class="floating-emoji">✨</span>
//                 </a>
//             </div>
//         </div>
        
//         <!-- Footer -->
//         <div class="footer">
//             <div class="brand-section">
//                 <div class="company-name">VibePass Entertainment Ltd.</div>
//                 <div class="company-tagline">Redefining cinematic experiences since 2025</div>
//             </div>
            
//             <div class="legal-section">
//                 You're receiving this premium cinema update as a valued VibePass member.<br>
//                 <div class="legal-links">
//                     <a href="https://vibe-pass-8z9z.onrender.com/unsubscribe">Unsubscribe</a> • 
//                     <a href="https://vibe-pass-8z9z.onrender.com/preferences">Preferences</a> • 
//                     <a href="https://vibe-pass-8z9z.onrender.com/support">Support</a>
//                 </div>
//             </div>
            
//             <div class="copyright">
//                 &copy; 2025 VibePass Entertainment Ltd. All cinematic rights reserved.<br>
//                 Crafting moments that last a lifetime. ✨
//             </div>
//         </div>
//     </div>
// </body>
// </html>
//     `
// };