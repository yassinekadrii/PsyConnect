const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Update profile (Password usually)
router.put('/profile', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, firstName, lastName, phone } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Update basic info if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;

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
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil' });
    }
});

module.exports = router;
