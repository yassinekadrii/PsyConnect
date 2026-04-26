/**
 * @file server.js
 * @description Main entry point for the PsyConnect backend server.
 * 
 * This file handles:
 * - Express application setup
 * - Socket.io initialization for real-time chat and WebRTC signaling
 * - Database connection (MongoDB)
 * - Middleware configuration (CORS, JSON parsing)
 * - Route registration
 * - Global error handling
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Security Middleware
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Use Helmet for secure headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for local dev/simplicity unless specific rules are needed
    crossOriginEmbedderPolicy: false
}));

// Basic rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard." }
});

// Apply limiter to all API routes
app.use('/api/', limiter);

// Sanitize NoSQL queries
app.use(express.json({ limit: '10mb' })); // Increased limit for PDF uploads

// Attach Socket.io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use((req, res, next) => {
    req.body = mongoSanitize(req.body);
    req.query = mongoSanitize(req.query);
    req.params = mongoSanitize(req.params);
    next();
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId, userId) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected from room ${roomId}`);
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    // Global user room for notifications (like calls)
    socket.on('join-user-room', (userId) => {
        console.log(`User ${userId} joined their personal room`);
        socket.join(`user_${userId}`);
    });

    // WebRTC Signaling
    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data);
    });

    socket.on('hangup', (data) => {
        socket.to(data.roomId).emit('hangup');
    });

    // Call Signaling
    socket.on('start-call', (data) => {
        const receiverId = data.receiverId;
        console.log(`Call started from ${socket.id} to user ${receiverId} in room ${data.roomId}`);
        // Notify the specific target user globally if possible, OR the current room
        if (receiverId) {
            socket.to(`user_${receiverId}`).emit('call-started', data);
        }
        socket.to(data.roomId).emit('call-started', data);
    });
});

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connecté avec succès'))
    .catch((err) => {
        console.error('❌ Erreur de connexion MongoDB:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/user', require('./routes/user'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/moods', require('./routes/moods'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/assessments', require('./routes/assessments'));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
