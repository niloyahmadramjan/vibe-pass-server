// controllers/chatController.js - SPECIFIC ADMIN ONLY
<<<<<<< HEAD
const ChatMessage = require('../models/chat')
const AIChat = require('../models/aiChat')
=======
const ChatMessage = require('../models/chat');
const AIChat = require("../models/aiChat");
const Coupon = require("../models/Coupon");
>>>>>>> ffb5b7a87556ba84e80dfc2d49498ee0774d5f7b
// GET list of users who chatted with SPECIFIC ADMIN ONLY
const getAllUsers = async (req, res) => {
  try {
    // ✅ FIXED: Hardcoded specific admin ID - শুধুমাত্র এই admin এর users show করবে
    const SPECIFIC_ADMIN_ID = '68e53b9752ef9ea3f4aa5566'

    // console.log(' Fetching users for specific admin:', SPECIFIC_ADMIN_ID);

    // শুধুমাত্র এই specific admin এর messages নিন
    const messages = await ChatMessage.find({
      $or: [
        { senderId: SPECIFIC_ADMIN_ID }, // এই admin sent messages
        { receiverId: SPECIFIC_ADMIN_ID }, // এই admin received messages
      ],
    }).sort({ createdAt: -1 })

    // console.log(`📨 Found ${messages.length} messages for admin ${SPECIFIC_ADMIN_ID}`);

    // Extract unique users who chatted with THIS SPECIFIC admin
    const usersMap = new Map()

    messages.forEach((msg) => {
      // Determine the other user in conversation (not this admin)
      let userId, userName

      if (msg.senderId === SPECIFIC_ADMIN_ID) {
        // এই admin sent message to user
        userId = msg.receiverId
        userName = msg.receiverName
      } else if (msg.receiverId === SPECIFIC_ADMIN_ID) {
        // User sent message to এই admin
        userId = msg.senderId
        userName = msg.senderName
      } else {
        return // Skip if not involving our specific admin
      }

      // Skip if user is admin or invalid
      if (!userId || userId === SPECIFIC_ADMIN_ID) return

      // Add user to map if not exists, or update if newer message
      if (
        !usersMap.has(userId) ||
        new Date(msg.createdAt) > new Date(usersMap.get(userId).lastMessage)
      ) {
        usersMap.set(userId, {
          _id: userId,
          name: userName || `User-${userId.substring(0, 8)}`,
          lastMessage: msg.createdAt,
          lastMessageText: msg.text,
          unreadCount:
            msg.receiverId === SPECIFIC_ADMIN_ID && !msg.read ? 1 : 0,
        })
      }
    })

    const users = Array.from(usersMap.values()).sort(
      (a, b) => new Date(b.lastMessage) - new Date(a.lastMessage)
    )

    // console.log(`✅ Returning ${users.length} unique users ONLY for admin ${SPECIFIC_ADMIN_ID}`);
    res.json(users)
  } catch (err) {
    console.error('❌ Get users error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET messages between user and admin - SPECIFIC ADMIN ONLY
const getMessages = async (req, res) => {
  try {
    const { userId, adminId } = req.query

    if (!userId || !adminId) {
      return res.status(400).json({ error: 'userId and adminId required' })
    }

    // ✅ Verify it's our specific admin
    const SPECIFIC_ADMIN_ID = '68e53b9752ef9ea3f4aa5566'
    if (adminId !== SPECIFIC_ADMIN_ID) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 })

    // Mark messages as read
    await ChatMessage.updateMany(
      { senderId: userId, receiverId: adminId, read: false },
      { $set: { read: true } }
    )

    res.json(messages)
  } catch (err) {
    console.error('Get messages error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST create message
const sendMessage = async (req, res) => {
  try {
    const { senderId, senderName, senderRole, receiverId, receiverName, text } =
      req.body

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const message = await ChatMessage.create({
      senderId,
      senderName,
      senderRole,
      receiverId,
      receiverName,
      text,
    })

    // Emit to Socket.IO
    const io = req.app.get('io')
    if (io) {
      io.to(receiverId).emit('receive_message', message)
      io.to(senderId).emit('receive_message', message)
      // console.log(`📨 Message sent from ${senderId} to ${receiverId}`);
    }

    res.status(201).json(message)
  } catch (err) {
    console.error('Send message error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId, adminId } = req.body

    await ChatMessage.updateMany(
      { senderId: userId, receiverId: adminId, read: false },
      { $set: { read: true } }
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Mark as read error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const axios = require('axios')
const { GoogleGenAI } = require('@google/genai')

// Initialize Google Gemini client

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const getWebsiteText = async (url) => {
<<<<<<< HEAD
  try {
    const res = await axios.get(url)
    const html = res.data

    // Remove HTML tags, scripts, and styles
    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return cleanText || 'No readable text found on the website.'
  } catch (err) {
    console.error('❌ Error fetching website:', err.message)
    return 'Failed to fetch website content.'
  }
}
=======
    try {
        const res = await axios.get(url);
        const html = res.data;
        const cleanText = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return cleanText || "No readable text found.";
    } catch (err) {
        console.error(" Error fetching website:", err.message);
        return "Failed to fetch website content.";
    }
};
>>>>>>> ffb5b7a87556ba84e80dfc2d49498ee0774d5f7b


// 🧠 AI Chat Response with Coupon Detection
const aiChatResponse = async (req, res) => {
<<<<<<< HEAD
  try {
    const { userMessage, userId, email } = req.body

    if (!userMessage)
      return res.status(400).json({ error: 'Missing userMessage' })
    if (!userId || !email)
      return res.status(400).json({ error: 'Missing userId or email' })

    // 🌍 Your live VibePass website URL
    const siteUrl = 'https://vibe-pass.vercel.app/'

    // console.log("🌐 Fetching website data...");
    const siteText = await getWebsiteText(siteUrl)
    // console.log(`✅ Website content fetched: ${siteText.length} chars`);

    // Build the prompt for Gemini AI
    const prompt = `
You are a helpful AI assistant for the movie ticket booking platform "VibePass".
Below is the live website content to help you answer contextually:
=======
    try {
        const { userMessage, userId, email } = req.body;
        if (!userMessage) return res.status(400).json({ error: "Missing userMessage" });
        if (!userId || !email) return res.status(400).json({ error: "Missing userId or email" });

        const siteUrl = "https://vibe-pass.vercel.app/";
        const siteText = await getWebsiteText(siteUrl);

        // 🌟 STEP 1: Check if user is asking about coupons/offers
        const lowerMsg = userMessage.toLowerCase(); const isCouponQuery = lowerMsg.includes("coupon") || lowerMsg.includes("offer") || lowerMsg.includes("discount");
        let botReply = "";

        if (isCouponQuery) {
            console.log("🎟 User asked about coupons — fetching active coupons...");

            const coupons = await Coupon.find({
                active: true,
                expiryDate: { $gte: new Date() },
                $or: [
                    { usageLimit: { $exists: false } },
                    { usageLimit: null },
                    { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
                ]
            }).sort({ createdAt: -1 });

            if (coupons.length === 0) {
                botReply = "Sorry , there are no active coupons right now. Please check back later!";
            } else {
                botReply = ` Here are your active coupons:\n\n`;
                coupons.forEach((c, i) => {
                    botReply += `${i + 1}. Code: **${c.code}** — ${c.discountType === "percentage"
                        ? `${c.discountValue}% OFF`
                        : `৳${c.discountValue} OFF`
                        }\n(Min purchase: ৳${c.minAmount}, Expires: ${new Date(c.expiryDate).toLocaleDateString()})\n\n`;
                });
            }
        }
 else {
            // 🌟 STEP 2: Regular AI response using website + Gemini
            const prompt = `
You are a helpful assistant for "VibePass" movie ticket platform.
Below is the website content for context:
>>>>>>> ffb5b7a87556ba84e80dfc2d49498ee0774d5f7b

${siteText}

User said: "${userMessage}"

<<<<<<< HEAD
Provide a clear, friendly, and helpful answer.
If the question is about movies, tickets, or bookings, give specific information based on the website.
If not related, reply politely in general.
    `

    // 🔮 Generate AI response
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const botReply =
      response?.text?.trim() || 'Sorry, I couldn’t generate a response.'

    // 🗃️ Save chat in MongoDB
    let chat = await AIChat.findOne({ userId, email })

    if (!chat) {
      chat = new AIChat({
        userId,
        email,
        messages: [],
      })
=======
If the question is about movies, tickets, or booking — answer from context.
If it's general, respond politely and concisely.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            botReply = response?.text?.trim() || "Sorry, I couldn’t generate a response.";
        }

        // 🌟 STEP 3: Save chat to DB
        let chat = await AIChat.findOne({ userId, email });
        if (!chat) chat = new AIChat({ userId, email, messages: [] });

        chat.messages.push({ sender: "user", text: userMessage, timestamp: new Date() });
        chat.messages.push({ sender: "bot", text: botReply, timestamp: new Date() });
        await chat.save();

        res.json({ reply: botReply });
    } catch (err) {
        console.error("❌ AI Chat Error:", err);
        res.status(500).json({ error: "AI response failed." });
>>>>>>> ffb5b7a87556ba84e80dfc2d49498ee0774d5f7b
    }

<<<<<<< HEAD
    // Add user message
    chat.messages.push({
      sender: 'user',
      text: userMessage,
      timestamp: new Date(),
    })

    // Add AI reply
    chat.messages.push({
      sender: 'bot',
      text: botReply,
      timestamp: new Date(),
    })

    await chat.save()

    // ✅ Send response back
    res.json({ reply: botReply })
  } catch (err) {
    console.error('❌ AI Chat Error:', err)
    res.status(500).json({ error: 'AI response failed.' })
  }
}

=======
>>>>>>> ffb5b7a87556ba84e80dfc2d49498ee0774d5f7b
const getAiChat = async (req, res) => {
  const { userId, email } = req.query
  if (!userId || !email)
    return res.status(400).json({ error: 'userId and email required' })

  try {
    const chat = await AIChat.findOne({ userId, email })
    res.json(chat || { messages: [] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = {
  aiChatResponse,
  getAllUsers,
  getMessages,
  markAsRead,
  sendMessage,
  getAiChat,
}
