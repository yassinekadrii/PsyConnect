/**
 * @file routes/messages.js
 * @description Routes for handling chat messages and conversations.
 * All routes require authentication.
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getConversation);

module.exports = router;
