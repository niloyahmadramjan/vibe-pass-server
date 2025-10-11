const nodemailer = require("nodemailer");
const Booking = require("../models/Booking");
const connectDB = require("../config/db");
require("dotenv").config();

exports.sendShowtimeReminders = async (req, res) => {
    try {
        await connectDB();

        const now = new Date();

        const bookings = await Booking.find({
            paymentStatus: "paid",
            reminderSent: { $ne: true },
        });

        const bookingsToRemind = bookings.filter(booking => {
            if (!booking.showDate || !booking.showTime) return false;

            const [time, modifier] = booking.showTime.split(" ");
            let [hours, minutes] = time.split(":").map(Number);

            if (modifier === "PM" && hours !== 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;

            const showDateTime = new Date(booking.showDate);
            showDateTime.setHours(hours, minutes, 0, 0);

            const diffMs = showDateTime - now;
            const diffMins = diffMs / (1000 * 60);

            return diffMins >= 29 && diffMins <= 31;
        });

        if (!bookingsToRemind.length) {
            return res.status(200).json({ message: "No reminders to send" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        for (const booking of bookingsToRemind) {
            // Calculate exact countdown time
            const [time, modifier] = booking.showTime.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (modifier === "PM" && hours !== 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;

            const showDateTime = new Date(booking.showDate);
            showDateTime.setHours(hours, minutes, 0, 0);

            // Calculate minutes remaining for static display
            const timeLeft = showDateTime - now;
            const minutesLeft = Math.floor(timeLeft / (1000 * 60));
            const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);

            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Showtime Reminder</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #CC2027 0%, #e74c3c 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .email-wrapper {
            max-width: 750px;
            margin: 0 auto;
            background: white;
            border-radius: 25px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            border: 4px solid #CC2027;
        }
        
        /* Premium Header with Red Gradient */
        .premium-header {
            background: linear-gradient(135deg, #CC2027 0%, #e74c3c 50%, #CC2027 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .premium-header::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        .movie-icon {
            font-size: 4em;
            margin-bottom: 20px;
            display: block;
            animation: bounce 2s infinite;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .premium-header h1 {
            font-size: 3em;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
        }
        
        .premium-header .subtitle {
            font-size: 1.3em;
            opacity: 0.95;
            font-weight: 300;
        }
        
        /* Movie Spotlight with Red Theme */
        .movie-spotlight {
            background: linear-gradient(135deg, #8B0000 0%, #CC2027 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 3px solid #FFD700;
            position: relative;
        }
        
        .movie-spotlight::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
            background-size: cover;
        }
        
        .movie-title {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            position: relative;
        }
        
        /* Countdown Timer */
        .countdown-container {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 15px;
            margin: 20px auto;
            max-width: 400px;
            border: 2px solid #FFD700;
        }
        
        .countdown-title {
            font-size: 1.2em;
            color: #FFD700;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .countdown-timer {
            font-size: 2em;
            font-weight: 700;
            color: #FFFFFF;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .showtime-countdown {
            font-size: 1.3em;
            color: #FFD700;
            font-weight: 600;
            margin-top: 10px;
        }
        
        /* Content Sections */
        .content-section {
            padding: 40px;
        }
        
        .info-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 25px;
            border-left: 6px solid #CC2027;
            box-shadow: 0 10px 25px rgba(204, 32, 39, 0.1);
            transition: transform 0.3s ease;
        }
        
        .info-card:hover {
            transform: translateY(-5px);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .card-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #CC2027, #e74c3c);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            color: white;
        }
        
        .card-title {
            font-size: 1.6em;
            font-weight: 600;
            color: #CC2027;
        }
        
        /* Enhanced Info Grid */
        .info-grid-enhanced {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .info-item-enhanced {
            background: white;
            padding: 20px;
            border-radius: 15px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .info-item-enhanced:hover {
            border-color: #CC2027;
            box-shadow: 0 8px 20px rgba(204, 32, 39, 0.15);
        }
        
        .info-label-enhanced {
            font-weight: 600;
            color: #CC2027;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .info-value-enhanced {
            font-size: 1.2em;
            font-weight: 500;
            color: #2c3e50;
        }
        
        /* Seats Display */
        .seats-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .seat-pill {
            background: linear-gradient(135deg, #CC2027, #e74c3c);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.9em;
            box-shadow: 0 4px 12px rgba(204, 32, 39, 0.3);
            transition: all 0.3s ease;
        }
        
        .seat-pill:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 18px rgba(204, 32, 39, 0.4);
        }
        
        /* Status Badge */
        .status-badge {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        /* Important Notice */
        .important-notice {
            background: linear-gradient(135deg, #ffe6e6, #ffcccc);
            border: 3px solid #CC2027;
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            margin-top: 30px;
        }
        
        .notice-icon {
            font-size: 2.5em;
            margin-bottom: 15px;
            display: block;
        }
        
        .notice-title {
            color: #CC2027;
            font-size: 1.4em;
            font-weight: 700;
            margin-bottom: 15px;
        }
        
        .notice-text {
            color: #CC2027;
            font-size: 1.1em;
            line-height: 1.6;
            font-weight: 500;
        }
        
        /* Premium Footer */
        .premium-footer {
            background: linear-gradient(135deg, #8B0000, #CC2027);
            color: white;
            padding: 40px;
            text-align: center;
            border-top: 5px solid #FFD700;
        }
        
        .footer-content {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .footer-logo {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #FFD700, #FFFFFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .footer-text {
            line-height: 1.8;
            opacity: 0.95;
            margin-bottom: 20px;
            font-size: 1.1em;
        }
        
        .contact-info {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 15px;
            margin-top: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .premium-header h1 {
                font-size: 2.2em;
            }
            
            .movie-title {
                font-size: 1.8em;
            }
            
            .content-section {
                padding: 25px 20px;
            }
            
            .info-grid-enhanced {
                grid-template-columns: 1fr;
            }
            
            .countdown-timer {
                font-size: 1.5em;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Premium Header -->
        <div class="premium-header">
            <span class="movie-icon"></span>
            <h1>SHOWTIME REMINDER</h1>
            <p class="subtitle">Lights, Camera, Action! Your movie starts soon</p>
        </div>
        
        <!-- Movie Spotlight with Countdown -->
        <div class="movie-spotlight">
            <div class="movie-title">${booking.movieTitle}</div>
            <div class="countdown-container">
                <div class="countdown-title"> SHOWTIME COUNTDOWN</div>
                <div class="countdown-timer">
                    ${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}
                </div>
                <div class="showtime-countdown">
                    Show at: ${booking.showTime}
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content-section">
            <!-- Show Information Card -->
            <div class="info-card">
                <div class="card-header">
                    <div class="card-icon"></div>
                    <div class="card-title">Show Information</div>
                </div>
                <div class="info-grid-enhanced">
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced">Movie Title</div>
                        <div class="info-value-enhanced">${booking.movieTitle}</div>
                    </div>
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced"> Theater Venue</div>
                        <div class="info-value-enhanced">${booking.theaterName}</div>
                    </div>
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced"> Screen Number</div>
                        <div class="info-value-enhanced">${booking.screen || 'Main Hall'}</div>
                    </div>
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced"> Show Date</div>
                        <div class="info-value-enhanced">${new Date(booking.showDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced"> Show Time</div>
                        <div class="info-value-enhanced">${booking.showTime}</div>
                    </div>
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced">💺 Your Seats</div>
                        <div class="seats-container">
                            ${booking.selectedSeats.map(seat => `<div class="seat-pill">${seat}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Booking Details Card -->
            <div class="info-card">
                <div class="card-header">
                    <div class="card-icon"></div>
                    <div class="card-title">Booking Details</div>
                </div>
                <div class="info-grid-enhanced">
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced"> Guest Name</div>
                        <div class="info-value-enhanced">${booking.userName || 'Valued Customer'}</div>
                    </div>
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced">Email Address</div>
                        <div class="info-value-enhanced">${booking.userEmail}</div>
                    </div>
                    <div class="info-item-enhanced">
                        <div class="info-label-enhanced"> Booking Status</div>
                        <div class="status-badge">✓ Confirmed & Paid</div>
                    </div>
                </div>
            </div>
            
            <!-- Important Notice -->
            <div class="important-notice">
                <span class="notice-icon">⚠️</span>
                <div class="notice-title">IMPORTANT REMINDERS</div>
                <div class="notice-text">
                    • Please arrive at least <strong>20 minutes</strong> before showtime<br>
                    • Bring a <strong>valid ID</strong> matching the booking name<br>
                    • Have your <strong>booking confirmation</strong> ready<br>
                    • <strong>No refunds</strong> 10 minutes after showtime
                </div>
            </div>
        </div>
        
        <!-- Premium Footer -->
        <div class="premium-footer">
            <div class="footer-content">
                <div class="footer-logo">CINEMA PALACE</div>
                <div class="footer-text">
                    Thank you for choosing us for your entertainment experience.<br>
                    We hope you enjoy the show and create wonderful memories!
                </div>
                <div class="contact-info">
                     123 Cinema Street, Movie City<br>
                     +880 1610665069<br>
                    ph.novasquad@gmail.com 
                </div>
            </div>
        </div>
    </div>
</body>
</html>
            `;

            await transporter.sendMail({
                from: `"Cinema Palace " <${process.env.EMAIL_USER}>`,
                to: booking.userEmail,
                subject: ` URGENT: ${booking.movieTitle} Starts in ${minutesLeft} Minutes! Get Ready!`,
                html,
            });

            booking.reminderSent = true;
            await booking.save();

            console.log(` Premium red theme reminder sent to ${booking.userEmail} - ${minutesLeft} minutes remaining`);
        }

        return res.status(200).json({ message: "Premium red theme reminders sent successfully" });
    } catch (err) {
        console.error("❌ Error sending premium reminders:", err);
        return res.status(500).json({ error: "Error sending premium reminders" });
    }
};