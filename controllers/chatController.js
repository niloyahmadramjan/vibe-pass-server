// =========================
// 📦 Imports
// =========================
const axios = require('axios')
const { GoogleGenAI } = require('@google/genai')
const ChatMessage = require('../models/chat')
const AIChat = require('../models/aiChat')
const Coupon = require('../models/Coupon')

// =========================
// 💬 SPECIFIC ADMIN CHAT CONTROLLER
// =========================

// ✅ Get list of users who chatted with the SPECIFIC ADMIN ONLY
const getAllUsers = async (req, res) => {
  try {
    const SPECIFIC_ADMIN_ID = '68e53b9752ef9ea3f4aa5566'

    const messages = await ChatMessage.find({
      $or: [{ senderId: SPECIFIC_ADMIN_ID }, { receiverId: SPECIFIC_ADMIN_ID }],
    }).sort({ createdAt: -1 })

    const usersMap = new Map()

    messages.forEach((msg) => {
      let userId, userName

      if (msg.senderId === SPECIFIC_ADMIN_ID) {
        userId = msg.receiverId
        userName = msg.receiverName
      } else if (msg.receiverId === SPECIFIC_ADMIN_ID) {
        userId = msg.senderId
        userName = msg.senderName
      } else return

      if (!userId || userId === SPECIFIC_ADMIN_ID) return

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

    res.json(users)
  } catch (err) {
    console.error('❌ Get users error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Get messages between specific user and admin
const getMessages = async (req, res) => {
  try {
    const { userId, adminId } = req.query

    if (!userId || !adminId)
      return res.status(400).json({ error: 'userId and adminId required' })

    const SPECIFIC_ADMIN_ID = '68e53b9752ef9ea3f4aa5566'
    if (adminId !== SPECIFIC_ADMIN_ID)
      return res.status(403).json({ error: 'Access denied' })

    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 })

    await ChatMessage.updateMany(
      { senderId: userId, receiverId: adminId, read: false },
      { $set: { read: true } }
    )

    res.json(messages)
  } catch (err) {
    console.error('❌ Get messages error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Send a chat message
const sendMessage = async (req, res) => {
  try {
    const { senderId, senderName, senderRole, receiverId, receiverName, text } =
      req.body

    if (!senderId || !receiverId || !text)
      return res.status(400).json({ error: 'Missing required fields' })

    const message = await ChatMessage.create({
      senderId,
      senderName,
      senderRole,
      receiverId,
      receiverName,
      text,
    })

    const io = req.app.get('io')
    if (io) {
      io.to(receiverId).emit('receive_message', message)
      io.to(senderId).emit('receive_message', message)
    }

    res.status(201).json(message)
  } catch (err) {
    console.error('❌ Send message error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ✅ Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId, adminId } = req.body

    await ChatMessage.updateMany(
      { senderId: userId, receiverId: adminId, read: false },
      { $set: { read: true } }
    )

    res.json({ success: true })
  } catch (err) {
    console.error('❌ Mark as read error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// =========================
// 🧠 AI CHAT CONTROLLER
// =========================

// Initialize Google Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// ✅ Helper: Extract clean text from a website
const getWebsiteText = async (url) => {
  try {
    const res = await axios.get(url)
    const html = res.data

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

// ✅ AI Chat Response with Coupon Detection
const aiChatResponse = async (req, res) => {
  try {
    const { userMessage, userId, email } = req.body

    if (!userMessage)
      return res.status(400).json({ error: 'Missing userMessage' })
    if (!userId || !email)
      return res.status(400).json({ error: 'Missing userId or email' })

    const siteUrl = 'https://vibe-pass.vercel.app/'
    const siteText = await getWebsiteText(siteUrl)

    const lowerMsg = userMessage.toLowerCase()
    const isCouponQuery =
      lowerMsg.includes('coupon') ||
      lowerMsg.includes('offer') ||
      lowerMsg.includes('discount')

    let botReply = ''

    // 🏷️ Step 1: Handle coupon-related queries
    if (isCouponQuery) {
      console.log('🎟 User asked about coupons — fetching active coupons...')

      const coupons = await Coupon.find({
        active: true,
        expiryDate: { $gte: new Date() },
        $or: [
          { usageLimit: { $exists: false } },
          { usageLimit: null },
          { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
        ],
      }).sort({ createdAt: -1 })

      if (coupons.length === 0) {
        botReply =
          'Sorry, there are no active coupons right now. Please check back later!'
      } else {
        botReply = `🎟️ Here are your active coupons:\n\n`
        coupons.forEach((c, i) => {
          botReply += `${i + 1}. Code: **${c.code}** — ${
            c.discountType === 'percentage'
              ? `${c.discountValue}% OFF`
              : `৳${c.discountValue} OFF`
          }\n(Min purchase: ৳${c.minAmount}, Expires: ${new Date(
            c.expiryDate
          ).toLocaleDateString()})\n\n`
        })
      }
    } else {
      // 🤖 Step 2: Regular AI response
      const prompt = `
You are a helpful assistant for the "VibePass" movie ticket booking platform.
Below is the website content for context:

${siteText}

User said: "${userMessage}"

Provide a friendly, accurate, and useful response.
If about movies, tickets, or bookings — answer using the site context.
If general, reply politely.
`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

      botReply =
        response?.text?.trim() || 'Sorry, I couldn’t generate a response.'
    }

    // 💾 Step 3: Save chat history in MongoDB
    let chat = await AIChat.findOne({ userId, email })
    if (!chat) chat = new AIChat({ userId, email, messages: [] })

    chat.messages.push({
      sender: 'user',
      text: userMessage,
      timestamp: new Date(),
    })
    chat.messages.push({
      sender: 'bot',
      text: botReply,
      timestamp: new Date(),
    })

    await chat.save()

    // ✅ Respond
    res.json({ reply: botReply })
  } catch (err) {
    console.error('❌ AI Chat Error:', err)
    res.status(500).json({ error: 'AI response failed.' })
  }
}

// ✅ Get AI chat history
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

// =========================
// 📤 Exports
// =========================
module.exports = {
  aiChatResponse,
  getAllUsers,
  getMessages,
  markAsRead,
  sendMessage,
  getAiChat,
}
