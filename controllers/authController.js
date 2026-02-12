/**
 * @file controllers/authController.js
 * @description Controller for user authentication (Register, Login).
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà.'
            });
        }

        // Create new patient (force role to patient)
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'patient' // Force patient role for public registration
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie.',
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
        console.log(`Login attempt for: ${email}`);

        // Validate required fields
        if (!email || !password) {
            console.log('Login failed: Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis.'
            });
        }

        // Find user and include password
        console.log('Searching for user...');
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`Login failed: User not found (${email})`);
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        console.log('User found, comparing passwords...');
        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            console.log('Login failed: Invalid password');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        console.log('Password valid, generating token...');
        // Generate token
        const token = generateToken(user._id);

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

module.exports = { register, login };
