const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {
    getMessages,
    sendMessage,
    getAllUsers,
    markAsRead,
    aiChatResponse,
 getAiChat

} = require("../controllers/chatController")

router.get('/messages', getMessages);
router.post('/send', sendMessage);
router.get('/users', getAllUsers);
router.post('/mark-read', markAsRead);

router.post("/ai", aiChatResponse);
router.get("/history", getAiChat)




module.exports = router;