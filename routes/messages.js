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
