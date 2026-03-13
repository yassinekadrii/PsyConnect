/**
 * @file routes/doctor.js
 * @description Routes for doctor-specific functionality.
 */

const express = require('express');
const router = express.Router();
const { getMyPatients } = require('../controllers/doctorController');
const { auth, isDoctor } = require('../middleware/auth');

// All doctor routes are protected
router.use(auth);
router.use(isDoctor);

// @route   GET /api/doctor/patients
// @desc    Get list of patients
// @access  Doctor only
router.get('/patients', getMyPatients);

module.exports = router;
