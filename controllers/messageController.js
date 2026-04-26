/**
 * @file controllers/messageController.js
 * @description Controller for managing chat messages and conversations.
 */

const Message = require('../models/Message');
const User = require('../models/User');
const Connection = require('../models/Connection');

const analyzeSentiment = (text) => {
    const positiveWords = ['bien', 'heureux', 'merci', 'super', 'génial', 'happy', 'good', 'thanks', 'great', 'سعيد', 'شكرا', 'جميل', 'ممتاز', 'شكراً'];
    const negativeWords = ['triste', 'mal', 'douleur', 'angoisse', 'peur', 'sad', 'bad', 'pain', 'fear', 'anxiety', 'حزين', 'ألم', 'خوف', 'قلق', 'تعبان'];

    let score = 0;
    const words = text.toLowerCase().split(/\s+/);

    words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) score += 1;
        if (negativeWords.some(nw => word.includes(nw))) score -= 1;
    });

    let sentiment = 'neutral';
    if (score > 0) sentiment = 'positive';
    if (score < 0) sentiment = 'negative';

    return { sentiment, score };
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        // Validate receiver
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Check Connection Permissions
        const isPatientMessagingDoctor = req.user.role === 'patient' && receiver.role === 'doctor';
        const isDoctorMessagingPatient = req.user.role === 'doctor' && receiver.role === 'patient';

        if (isPatientMessagingDoctor || isDoctorMessagingPatient) {
            const patientId = req.user.role === 'patient' ? req.user.id : receiverId;
            const doctorId = req.user.role === 'doctor' ? req.user.id : receiverId;

            console.log(`Checking connection: patient=${patientId}, doctor=${doctorId}`);
            const connection = await Connection.findOne({ patient: patientId, doctor: doctorId });
            console.log(`Connection found: ${connection ? connection.status : 'NONE'}`);

            if (!connection && isPatientMessagingDoctor) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Vous devez demander une connexion à ce médecin avant d\'envoyer un message.',
                    needsConnection: true,
                    debug: 'No connection found in database'
                });
            }

            if (connection) {
                if (connection.status === 'pending' && isPatientMessagingDoctor) {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'Votre demande de connexion est en attente d\'acceptation.',
                        status: 'pending',
                        debug: 'Connection status is pending'
                    });
                }
                if (connection.status === 'blocked') {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'La communication avec cet utilisateur est bloquée.',
                        status: 'blocked',
                        debug: 'Connection status is blocked'
                    });
                }
            }
        }

        const { sentiment, score } = analyzeSentiment(content);

        const message = new Message({
            sender: req.user.id,
            receiver: receiverId,
            content,
            sentiment,
            moodScore: score
        });

        await message.save();

        // Emit via socket if io is available
        if (req.io) {
            const roomId = [req.user.id, receiverId].sort().join('-');
            req.io.to(roomId).emit('receive-message', {
                _id: message._id,
                sender: req.user.id,
                receiver: receiverId,
                content: content,
                sentiment: sentiment,
                moodScore: score,
                createdAt: message.createdAt
            });
        }

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi du message',
            debug: error.message 
        });
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
            // Skip messages where sender or receiver might be null (deleted user)
            if (!msg.sender || !msg.receiver) return;

            // Safely get IDs whether populated or not
            const senderId = (msg.sender._id || msg.sender).toString();
            const receiverId = (msg.receiver._id || msg.receiver).toString();
            const currentId = currentUserId.toString();

            const otherUser = senderId === currentId ? msg.receiver : msg.sender;

            if (!otherUser) return;
            const otherUserId = (otherUser._id || otherUser).toString();

            if (!seenUsers.has(otherUserId)) {
                seenUsers.add(otherUserId);
                conversations.push({
                    user: otherUser,
                    lastMessage: msg.content,
                    sentiment: msg.sentiment,
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
