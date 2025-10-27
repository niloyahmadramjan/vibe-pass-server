// models/chat.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, enum: ['user', 'admin'], required: true },
        receiverId: { type: String, required: true },
        receiverName: { type: String },
        senderImage: { type: String },
        text: { type: String, required: true },
        read: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', messageSchema);