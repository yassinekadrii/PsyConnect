const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

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
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil' });
    }
});

module.exports = router;
