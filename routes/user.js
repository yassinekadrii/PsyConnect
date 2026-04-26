const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

// Update profile (Password usually)
router.put('/profile', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, firstName, lastName, phone, profilePicture, certification, cv, bio, specialty, availability, location, consultationMode } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Update basic info if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (certification !== undefined && user.role === 'doctor') user.certification = certification;
        if (cv !== undefined && user.role === 'doctor') user.cv = cv;
        if (bio !== undefined && user.role === 'doctor') user.bio = bio;
        if (specialty !== undefined && user.role === 'doctor') user.specialty = specialty;
        if (availability !== undefined && user.role === 'doctor') user.availability = availability;
        if (location !== undefined && user.role === 'doctor') user.location = location;
        if (consultationMode !== undefined && user.role === 'doctor') user.consultationMode = consultationMode;

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Mot de passe actuel requis pour changer le mot de passe' });
            }

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
            }

            user.password = newPassword;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture,
                certification: user.certification,
                cv: user.cv,
                bio: user.bio,
                specialty: user.specialty,
                availability: user.availability,
                location: user.location,
                consultationMode: user.consultationMode
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour du profil',
            debug: error.message 
        });
    }
});

// Upload profile picture
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Veuillez sélectionner une image' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Save the file path in the user model
        // We store the relative path that can be served via /uploads
        const avatarUrl = `/uploads/${req.file.filename}`;
        user.profilePicture = avatarUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Photo de profil mise à jour',
            profilePicture: avatarUrl
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ success: false, message: error.message || 'Erreur lors de l\'upload' });
    }
});

module.exports = router;
