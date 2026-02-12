/**
 * @file controllers/adminController.js
 * @description Controller logic for administrative actions.
 * 
 * Handles:
 * - Doctor account creation and management
 * - Patient management
 * - Admin account management
 * - Dashboard statistics
 */

const User = require('../models/User');
const Message = require('../models/Message');
const Prescription = require('../models/Prescription');

// @desc    Create a new doctor account
// @route   POST /api/admin/create-doctor
// @access  Admin only
const createDoctor = async (req, res) => {
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

        // Create new doctor
        const doctor = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'doctor'
        });

        await doctor.save();

        res.status(201).json({
            success: true,
            message: 'Compte médecin créé avec succès.',
            doctor: {
                id: doctor._id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                phone: doctor.phone,
                role: doctor.role,
                profilePicture: doctor.profilePicture || '',
                certification: doctor.certification || '',
                cv: doctor.cv || '',
                bio: doctor.bio || '',
                specialty: doctor.specialty || '',
                availability: doctor.availability || '',
                location: doctor.location || '',
                consultationMode: doctor.consultationMode || 'online',
                createdAt: doctor.createdAt
            }
        });
    } catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du compte médecin.',
            error: error.message
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin only
const getDashboardStats = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalUsers = await User.countDocuments();
        const totalMessages = await Message.countDocuments();
        const totalPrescriptions = await Prescription.countDocuments();

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentPatients = await User.countDocuments({
            role: 'patient',
            createdAt: { $gte: thirtyDaysAgo }
        });

        const recentDoctors = await User.countDocuments({
            role: 'doctor',
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalPatients,
                totalDoctors,
                totalUsers,
                totalMessages,
                totalPrescriptions,
                recentPatients,
                recentDoctors
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques.',
            error: error.message
        });
    }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Admin only
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des médecins.',
            error: error.message
        });
    }
};

// @desc    Delete a doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Admin only
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Médecin non trouvé.'
            });
        }

        if (doctor.role !== 'doctor') {
            return res.status(400).json({
                success: false,
                message: 'Cet utilisateur n\'est pas un médecin.'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Médecin supprimé avec succès.'
        });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du médecin.',
            error: error.message
        });
    }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Admin only
const getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des patients.',
            error: error.message
        });
    }
};

// @desc    Delete a patient
// @route   DELETE /api/admin/patients/:id
// @access  Admin only
const deletePatient = async (req, res) => {
    try {
        const patient = await User.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé.'
            });
        }

        if (patient.role !== 'patient') {
            return res.status(400).json({
                success: false,
                message: 'Cet utilisateur n\'est pas un patient.'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Patient supprimé avec succès.'
        });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du patient.',
            error: error.message
        });
    }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Super Admin only
const getAllAdmins = async (req, res) => {
    try {
        // Exclude the current user (the one making the request) from the list
        const admins = await User.find({ role: 'admin', _id: { $ne: req.user.id } })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: admins.length,
            admins
        });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des administrateurs.',
            error: error.message
        });
    }
};

// @desc    Delete an admin
// @route   DELETE /api/admin/admins/:id
// @access  Super Admin only
const deleteAdmin = async (req, res) => {
    try {
        const adminToDelete = await User.findById(req.params.id);

        if (!adminToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Administrateur non trouvé.'
            });
        }

        if (adminToDelete.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cet utilisateur n\'est pas un administrateur.'
            });
        }

        // Prevent deleting a Super Admin? Maybe. For now, assume Super Admin can delete other admins.
        // It's safer to prevent deleting another Super Admin unless you are "the" root admin, but let's just do simple delete for now.

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Administrateur supprimé avec succès.'
        });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'administrateur.',
            error: error.message
        });
    }
};

module.exports = {
    createDoctor,
    getDashboardStats,
    getAllDoctors,
    deleteDoctor,
    getAllPatients,
    deletePatient,
    getAllAdmins,
    deleteAdmin
};

