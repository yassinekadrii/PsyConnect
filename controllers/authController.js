/**
 * @file controllers/authController.js
 * @description Controller for user authentication (Register, Login).
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');
const crypto = require('crypto');
const Attempt = require('../models/Attempt');

/**
 * Helper to log access attempts
 */
const logAttempt = async (req, email, type, status, message = '') => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        await Attempt.create({
            email,
            ip,
            userAgent,
            type,
            status,
            message
        });
    } catch (err) {
        console.error('Failed to log attempt:', err);
    }
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    const fs = require('fs');
    fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] ENTERING register for ${req.body.email}\n`);
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await logAttempt(req, email, 'register', 'fail', 'Cet email est déjà utilisé');
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà.'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Create new patient (force role to patient)
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'patient',
            verificationOTP: otp,
            otpExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        await user.save();
        await logAttempt(req, email, 'register', 'success');

        // Send Email (don't await so registration is fast)
        sendVerificationEmail(user.email, otp).catch(err => {
            console.error('Verification email failed:', err);
            const fs = require('fs');
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] EMAIL FAIL for ${user.email}: ${err.message}\n`);
        });

        // Generate temporary token (can't access dashboard yet)
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie. Veuillez vérifier votre email pour le code OTP.',
            token,
            isVerified: false,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription.',
            error: error.message
        });
    }
};

// @desc    Login user (all roles)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const fs = require('fs');
        fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN ATTEMPT: ${email}\n`);

        // Validate required fields
        if (!email || !password) {
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN FAIL: Missing fields\n`);
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis.'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN FAIL: User not found: ${email}\n`);
            await logAttempt(req, email, 'login', 'fail', 'Utilisateur non trouvé');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        // Check if verified
        if (!user.isVerified) {
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN FAIL: Not verified: ${email}\n`);
            return res.status(403).json({
                success: false,
                message: 'Veuillez vérifier votre email avant de vous connecter.',
                needsVerification: true,
                email: user.email,
                id: user._id
            });
        }

        fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN PROCEEDING: Password check for ${email}\n`);

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN FAIL: Invalid password: ${email}\n`);
            await logAttempt(req, email, 'login', 'fail', 'Mot de passe incorrect');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN SUCCESS: ${email}\n`);
        // Generate token
        const token = generateToken(user._id);
        await logAttempt(req, email, 'login', 'success');

        console.log('Login successful, sending response');
        res.status(200).json({
            success: true,
            message: 'Connexion réussie.',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture || '',
                certification: user.certification || '',
                cv: user.cv || '',
                bio: user.bio || '',
                specialty: user.specialty || '',
                availability: user.availability || '',
                location: user.location || '',
                consultationMode: user.consultationMode || 'online'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion.',
            error: error.message
        });
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user is already populated by the auth middleware
        const user = req.user;
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin,
                profilePicture: user.profilePicture || '',
                certification: user.certification || '',
                cv: user.cv || '',
                bio: user.bio || '',
                specialty: user.specialty || '',
                availability: user.availability || '',
                location: user.location || '',
                consultationMode: user.consultationMode || 'online',
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil.'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, bio, specialty, location, consultationMode } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Update fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (specialty) user.specialty = specialty;
        if (location) user.location = location;
        if (consultationMode) user.consultationMode = consultationMode;

        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture || '',
                bio: user.bio || '',
                specialty: user.specialty || '',
                location: user.location || '',
                consultationMode: user.consultationMode || 'online'
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil' });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis' });
        }

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du mot de passe' });
    }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email et OTP requis' });
        }

        const user = await User.findOne({
            email,
            verificationOTP: otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            await logAttempt(req, email, 'verify', 'fail', 'OTP invalide ou expiré');
            return res.status(400).json({ success: false, message: 'Code OTP invalide ou expiré' });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.otpExpires = undefined;
        await user.save();
        await logAttempt(req, email, 'verify', 'success');

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Email vérifié avec succès',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la vérification' });
    }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Cet email est déjà vérifié' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationOTP = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendVerificationEmail(user.email, otp).catch(err => {
            console.error('Resend email failed:', err);
            const fs = require('fs');
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] RESEND FAIL for ${user.email}: ${err.message}\n`);
        });

        res.json({ success: true, message: 'Nouveau code envoyé' });
    } catch (error) {
        console.error('Resend error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du code' });
    }
};

module.exports = { register, login, getMe, updateProfile, updatePassword, verifyEmail, resendOTP };
