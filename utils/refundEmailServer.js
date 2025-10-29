const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password recommended
  },
});

/**
 * Send refund confirmation email to user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} refundId - Refund request ID
 * @param {object} refundData - Additional refund data
 */
exports.sendRefundConfirmation = async (userEmail, userName, refundId, refundData = {}) => {
  try {
    const {
      movieTitle = 'Unknown Movie',
      theaterName = 'Unknown Theater',
      amount = 0,
      showTime = 'Not specified',
      selectedSeats = [],
      transactionId = 'N/A'
    } = refundData;

    const mailOptions = {
      from: {
        name: 'VibePass Cinema',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Refund Request Received - VibePass',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Confirmation - VibePass</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .confirmation-icon {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .confirmation-icon .icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
        }
        
        .greeting {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .greeting h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .greeting p {
            color: #6b7280;
            font-size: 16px;
        }
        
        .refund-details {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .detail-item:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: #6b7280;
            font-weight: 500;
            font-size: 14px;
        }
        
        .detail-value {
            color: #1f2937;
            font-weight: 600;
            font-size: 14px;
            text-align: right;
        }
        
        .amount-highlight {
            color: #10b981;
            font-size: 18px !important;
        }
        
        .seats-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: flex-end;
        }
        
        .seat-tag {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .timeline {
            margin: 30px 0;
        }
        
        .timeline-title {
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .timeline-steps {
            display: flex;
            justify-content: space-between;
            position: relative;
            margin: 0 20px;
        }
        
        .timeline-steps::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 0;
            right: 0;
            height: 2px;
            background: #e5e7eb;
            z-index: 1;
        }
        
        .timeline-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            z-index: 2;
        }
        
        .step-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            border: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            font-weight: 600;
            color: #9ca3af;
        }
        
        .step-icon.active {
            background: #667eea;
            border-color: #667eea;
            color: white;
        }
        
        .step-label {
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            font-weight: 500;
        }
        
        .step-label.active {
            color: #667eea;
            font-weight: 600;
        }
        
        .next-steps {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
        }
        
        .next-steps h3 {
            color: #0369a1;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .next-steps ul {
            list-style: none;
            padding: 0;
        }
        
        .next-steps li {
            padding: 8px 0;
            color: #1e40af;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .next-steps li::before {
            content: '✓';
            color: #10b981;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .support-section {
            text-align: center;
            padding: 25px;
            background: #f8fafc;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        
        .support-section h3 {
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .support-section p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .support-contact {
            color: #667eea;
            font-weight: 600;
            text-decoration: none;
            font-size: 16px;
        }
        
        .email-footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
        }
        
        .footer-logo {
            font-size: 24px;
            font-weight: 700;
            color: white;
            margin-bottom: 15px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .footer-links a {
            color: #9ca3af;
            text-decoration: none;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            color: white;
        }
        
        .copyright {
            font-size: 12px;
            margin-top: 15px;
        }
        
        @media (max-width: 600px) {
            .email-header {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .detail-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .detail-value {
                text-align: left;
            }
            
            .seats-list {
                justify-content: flex-start;
            }
            
            .timeline-steps {
                flex-direction: column;
                gap: 20px;
                margin: 0;
            }
            
            .timeline-steps::before {
                display: none;
            }
            
            .timeline-step {
                flex-direction: row;
                gap: 15px;
            }
            
            .step-icon {
                margin-bottom: 0;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>Refund Request Received</h1>
            <p>We've received your refund request and it's being processed</p>
        </div>
        
        <!-- Body -->
        <div class="email-body">
            <!-- Confirmation Icon -->
            <div class="confirmation-icon">
                <div class="icon">✓</div>
            </div>
            
            <!-- Greeting -->
            <div class="greeting">
                <h2>Hello, ${userName}!</h2>
                <p>Your refund request has been successfully submitted and is now under review.</p>
            </div>
            
            <!-- Refund Details -->
            <div class="refund-details">
                <div class="detail-item">
                    <span class="detail-label">Refund ID</span>
                    <span class="detail-value">${refundId}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Movie</span>
                    <span class="detail-value">${movieTitle}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Theater</span>
                    <span class="detail-value">${theaterName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Show Time</span>
                    <span class="detail-value">${showTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Selected Seats</span>
                    <div class="detail-value">
                        <div class="seats-list">
                            ${selectedSeats.map(seat => `<span class="seat-tag">${seat}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Transaction ID</span>
                    <span class="detail-value">${transactionId}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Refund Amount</span>
                    <span class="detail-value amount-highlight">৳${amount}</span>
                </div>
            </div>
            
            <!-- Timeline -->
            <div class="timeline">
                <h3 class="timeline-title">Refund Process Timeline</h3>
                <div class="timeline-steps">
                    <div class="timeline-step">
                        <div class="step-icon active">1</div>
                        <span class="step-label active">Request Submitted</span>
                    </div>
                    <div class="timeline-step">
                        <div class="step-icon">2</div>
                        <span class="step-label">Under Review</span>
                    </div>
                    <div class="timeline-step">
                        <div class="step-icon">3</div>
                        <span class="step-label">Processing</span>
                    </div>
                    <div class="timeline-step">
                        <div class="step-icon">4</div>
                        <span class="step-label">Completed</span>
                    </div>
                </div>
            </div>
            
            <!-- Next Steps -->
            <div class="next-steps">
                <h3>📋 What Happens Next?</h3>
                <ul>
                    <li>Our team will review your request within 24 hours</li>
                    <li>You'll receive email updates on your refund status</li>
                    <li>Refund processing typically takes 5-7 business days</li>
                    <li>Amount will be credited to your original payment method</li>
                </ul>
            </div>
            
            <!-- Support Section -->
            <div class="support-section">
                <h3>Need Help?</h3>
                <p>If you have any questions about your refund, our support team is here to help.</p>
                <a href="mailto:support@vibepass.com" class="support-contact">support@vibepass.com</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <div class="footer-logo">VibePass</div>
            <div class="footer-links">
                <a href="#">Home</a>
                <a href="#">Movies</a>
                <a href="#">Support</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </div>
            <div class="copyright">
                © 2024 VibePass Cinema. All rights reserved.<br>
                This is an automated email, please do not reply.
            </div>
        </div>
    </div>
</body>
</html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Refund confirmation email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending refund confirmation email:', error);
    throw error;
  }
};

/**
 * Send refund status update email to user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} refundId - Refund request ID
 * @param {string} status - New refund status
 * @param {object} additionalData - Additional data like admin notes, etc.
 */
exports.sendRefundStatusUpdate = async (userEmail, userName, refundId, status, additionalData = {}) => {
  try {
    const { adminNotes = '', refundAmount = 0, processedAt = new Date() } = additionalData;

    const statusConfig = {
      approved: {
        color: '#10B981',
        icon: '✅',
        title: 'Refund Approved',
        message: 'Your refund request has been approved and is now being processed.',
        nextStep: 'The amount will be credited to your account within 3-5 business days.'
      },
      rejected: {
        color: '#EF4444',
        icon: '❌',
        title: 'Refund Rejected',
        message: 'Your refund request has been rejected.',
        nextStep: adminNotes || 'Please contact support for more information.'
      },
      processed: {
        color: '#8B5CF6',
        icon: '💰',
        title: 'Refund Processed',
        message: 'Your refund has been successfully processed!',
        nextStep: `Amount credited: ৳${refundAmount}`
      },
      cancelled: {
        color: '#6B7280',
        icon: '⏹️',
        title: 'Refund Cancelled',
        message: 'Your refund request has been cancelled.',
        nextStep: 'The booking remains active as per your request.'
      }
    };

    const config = statusConfig[status] || {
      color: '#667eea',
      icon: '📝',
      title: `Refund ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your refund request has been ${status}.`,
      nextStep: 'You will be notified of any further updates.'
    };

    const mailOptions = {
      from: {
        name: 'VibePass Cinema',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: `${config.icon} Refund ${status.charAt(0).toUpperCase() + status.slice(1)} - VibePass`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Status Update - VibePass</title>
    <style>
        /* Same CSS as above, but with status-specific colors */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            background: ${config.color};
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .email-header p { font-size: 16px; opacity: 0.9; font-weight: 400; }
        
        .email-body { padding: 40px 30px; }
        
        .status-icon {
            text-align: center;
            margin-bottom: 30px;
            font-size: 48px;
        }
        
        .greeting { text-align: center; margin-bottom: 30px; }
        .greeting h2 { color: #1f2937; font-size: 24px; font-weight: 600; margin-bottom: 8px; }
        .greeting p { color: #6b7280; font-size: 16px; }
        
        .status-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .status-badge {
            display: inline-block;
            background: ${config.color};
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        
        .refund-id {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .update-time {
            color: #9ca3af;
            font-size: 12px;
        }
        
        .next-step {
            background: ${config.color}10;
            border: 1px solid ${config.color}30;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .next-step h3 {
            color: ${config.color};
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .next-step p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .support-section {
            text-align: center;
            padding: 25px;
            background: #f8fafc;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        
        .support-section h3 { color: #1f2937; font-size: 18px; font-weight: 600; margin-bottom: 10px; }
        .support-section p { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
        .support-contact { color: #667eea; font-weight: 600; text-decoration: none; font-size: 16px; }
        
        .email-footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
        }
        
        .footer-logo { font-size: 24px; font-weight: 700; color: white; margin-bottom: 15px; }
        .footer-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 15px; flex-wrap: wrap; }
        .footer-links a { color: #9ca3af; text-decoration: none; font-size: 14px; }
        .footer-links a:hover { color: white; }
        .copyright { font-size: 12px; margin-top: 15px; }
        
        @media (max-width: 600px) {
            .email-header { padding: 30px 20px; }
            .email-header h1 { font-size: 24px; }
            .email-body { padding: 30px 20px; }
            .footer-links { flex-direction: column; gap: 10px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>${config.title}</h1>
            <p>${config.message}</p>
        </div>
        
        <div class="email-body">
            <div class="status-icon">
                ${config.icon}
            </div>
            
            <div class="greeting">
                <h2>Hello, ${userName}!</h2>
                <p>Your refund request status has been updated.</p>
            </div>
            
            <div class="status-card">
                <div class="status-badge">${status}</div>
                <div class="refund-id">Refund ID: ${refundId}</div>
                <div class="update-time">Updated: ${new Date(processedAt).toLocaleString()}</div>
            </div>
            
            <div class="next-step">
                <h3>Next Steps</h3>
                <p>${config.nextStep}</p>
                ${adminNotes ? `<p style="margin-top: 10px; padding: 10px; background: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;"><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
            </div>
            
            <div class="support-section">
                <h3>Questions?</h3>
                <p>Our support team is always here to help you.</p>
                <a href="mailto:support@vibepass.com" class="support-contact">support@vibepass.com</a>
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-logo">VibePass</div>
            <div class="footer-links">
                <a href="#">Home</a>
                <a href="#">Movies</a>
                <a href="#">Support</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </div>
            <div class="copyright">
                © 2024 VibePass Cinema. All rights reserved.<br>
                This is an automated email, please do not reply.
            </div>
        </div>
    </div>
</body>
</html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Refund status update email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending refund status email:', error);
    throw error;
  }
};

/**
 * Test email configuration
 */
exports.testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error);
    return false;
  }
};