/**
 * @file routes/admin.js
 * @description Administrative routes for managing doctors, patients, and admins.
 * 
 * Access levels:
 * - Admin: Manage doctors and patients, view dashboard stats.
 * - Super Admin: Everything + Manage other admin accounts.
 */

const express = require('express');
const {
    createDoctor,
    getDashboardStats,
    getAllDoctors,
    deleteDoctor,
    getAllPatients,
    deletePatient,
    getAllAdmins,
    deleteAdmin
} = require('../controllers/adminController');
const { auth, isAdmin, isSuperAdmin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(isAdmin);

// @route   POST /api/admin/create-admin
// @desc    Create a new admin account
// @access  Super Admin only
router.post('/create-admin', isSuperAdmin, async (req, res) => {
    // ... existing implementation ...
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
        }

        user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'admin',
            isSuperAdmin: false // Default new admins are NOT super admins
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Administrateur créé avec succès',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'administrateur' });
    }
});

// @route   GET /api/admin/admins
// @desc    Get all admins
// @access  Super Admin only
router.get('/admins', isSuperAdmin, getAllAdmins);

// @route   DELETE /api/admin/admins/:id
// @desc    Delete an admin
// @access  Super Admin only
router.delete('/admins/:id', isSuperAdmin, deleteAdmin);

// @route   POST /api/admin/create-doctor
// @desc    Create a new doctor account
// @access  Admin only
router.post('/create-doctor', createDoctor);

// ... (other routes same as before) ...

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/doctors
// @desc    Get all doctors
// @access  Admin only
router.get('/doctors', getAllDoctors);

// @route   DELETE /api/admin/doctors/:id
// @desc    Delete a doctor
// @access  Admin only
router.delete('/doctors/:id', deleteDoctor);

// @route   GET /api/admin/patients
// @desc    Get all patients
// @access  Admin only
router.get('/patients', getAllPatients);

// @route   DELETE /api/admin/patients/:id
// @desc    Delete a patient
// @access  Admin only
router.delete('/patients/:id', deletePatient);

module.exports = router;
