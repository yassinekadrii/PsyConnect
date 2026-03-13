/**
 * @file controllers/doctorController.js
 * @description Controller logic for doctor-specific actions.
 */

const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Get patients associated with this doctor
// @route   GET /api/doctor/patients
// @access  Doctor only
const getMyPatients = async (req, res) => {
    try {
        // For now, let's return all patients in the system
        // In a real app, we would filter by doctor assignments or previous chats
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .sort({ lastName: 1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('Get doctor patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des patients.',
            error: error.message
        });
    }
};

module.exports = {
    getMyPatients
};
