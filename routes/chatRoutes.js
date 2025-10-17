const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');


router.get('/messages', chatController.getMessages);
router.post('/send', chatController.sendMessage);
router.get('/users', chatController.getAllUsers);
router.post('/mark-read', chatController.markAsRead);

module.exports = router;