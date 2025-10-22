// =========================
// 💬 Chat Socket Service
// =========================

const User = require('../models/user')
const ChatMessage = require('../models/chat')

module.exports = (io) => {
  // Store connected user sockets
  const connectedUsers = new Map()

  io.on('connection', (socket) => {
    // console.log(` Chat user connected: ${socket.id}`)

    // ✅ Register user for personal room
    socket.on('register_user', (userId) => {
      if (!userId) return

      // Leave previous rooms (cleanup)
      Object.keys(socket.rooms).forEach((room) => {
        if (room !== socket.id) socket.leave(room)
      })

      // Join user's private room
      socket.join(userId)
      connectedUsers.set(userId, socket.id)

      // console.log(`✅ Registered user: ${userId} (${socket.id})`)
    })

    // ✅ Send and receive private messages
    socket.on('send_message', async (msg) => {
      try {
        if (!msg?.senderId || !msg?.receiverId || !msg?.text) {
          // console.log('❌ Invalid message format')
          return
        }

        // console.log('📨 Message received:', msg)

        // Save message to DB
        const saved = await ChatMessage.create(msg)

        // Emit to receiver and sender
        io.to(msg.receiverId).emit('receive_message', saved)
        io.to(msg.senderId).emit('receive_message', saved)

        // console.log(`✅ Message delivered from ${msg.senderId} to ${msg.receiverId}`)
      } catch (err) {
        console.error('❌ Message send error:', err)
        socket.emit('message_error', { error: 'Failed to send message' })
      }
    })

    // ✅ Handle disconnect
    socket.on('disconnect', (reason) => {
      // console.log(`❌ Chat user disconnected: ${socket.id} (${reason})`)

      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId)
          // console.log(`🗑️ Removed user: ${userId}`)
          break
        }
      }
    })
  })
}
