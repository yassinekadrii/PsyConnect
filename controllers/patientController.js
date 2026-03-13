/**
 * @file controllers/patientController.js
 * @description Controller for patient-specific actions, such as viewing doctor profiles.
 */

const User = require('../models/User');

// @desc    Get all doctors (public info only)
// @route   GET /api/patient/doctors
// @access  Public
exports.getAllDoctorsPublic = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
            .select('firstName lastName specialty bio profilePicture certification cv availability location consultationMode _id')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des médecins'
        });
    }
};

// @desc    Get a single doctor by ID (public info)
// @route   GET /api/patient/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
            .select('firstName lastName specialty bio profilePicture certification cv availability location consultationMode _id');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Médecin non trouvé.'
            });
        }

        res.json({
            success: true,
            doctor
        });
    } catch (error) {
        console.error('Error fetching doctor by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du médecin'
        });
    }
};
