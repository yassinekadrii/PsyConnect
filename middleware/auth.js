/**
 * @file middleware/auth.js
 * @description Middleware functions for authentication and role-based access control (RBAC).
 * 
 * Provides:
 * - auth: Verifies JWT token and attaches user to request
 * - isAdmin: Restricted to users with 'admin' role
 * - isDoctor: Restricted to users with 'doctor' or 'admin' roles
 * - isSuperAdmin: Restricted to users flagged as super admins
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(process.cwd(), 'api-debug.log');

const logToDebug = (message) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] AUTH_TRACE: ${message}\n`);
};

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    const requestId = Math.random().toString(36).substring(7);
    logToDebug(`[${requestId}] START ${req.method} ${req.originalUrl}`);
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Accès refusé. Aucun token fourni.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide. Utilisateur non trouvé.'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = decoded.userId;

        logToDebug(`[${requestId}] SUCCESS Authenticated as ${user.email} (${user.role})`);
        next();
    } catch (error) {
        logToDebug(`[${requestId}] ERROR: ${error.message}`);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'authentification.'
        });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits administrateur requis.'
        });
    }
    next();
};

// Middleware to check if user is doctor
const isDoctor = (req, res, next) => {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits de médecin requis.'
        });
    }
    next();
};

// Middleware to check if user is super admin
const isSuperAdmin = (req, res, next) => {
    if (!req.user.isSuperAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits Super Admin requis.'
        });
    }
    next();
};

module.exports = { auth, isAdmin, isSuperAdmin, isDoctor };
