/**
 * @file controllers/messageController.js
 * @description Controller for managing chat messages and conversations.
 */

const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        // Validate receiver
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const message = new Message({
            sender: req.user.id,
            receiver: receiverId,
            content
        });

        await message.save();

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message' });
    }
};

// Get conversation with a specific user
exports.getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first for chat history

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la conversation' });
    }
};

// Get list of conversations (users interacted with)
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find all messages involving current user
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'firstName lastName role profilePicture')
            .populate('receiver', 'firstName lastName role profilePicture');

        const conversations = [];
        const seenUsers = new Set();

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === currentUserId.toString()
                ? msg.receiver
                : msg.sender;

            if (!seenUsers.has(otherUser._id.toString())) {
                seenUsers.add(otherUser._id.toString());
                conversations.push({
                    user: otherUser,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt
                });
            }
        });

        res.json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des conversations' });
    }
};
