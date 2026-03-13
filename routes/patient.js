/**
 * @file routes/patient.js
 * @description Patient-specific routes, such as public doctor listings.
 */

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Public route to view doctors (or protected if you prefer)
// Using auth middleware optionally to allow public viewing but better tracking?
// For now, let's make it public or require patient login. 
// The user request implies patients see this, so let's protect it or make it public.
// Making it public for "Find a Doctor" page seems appropriate for a landing page feature,
// but for "My Doctors" chat it needs auth.
// Let's make the list public for now so visitors can see doctors.

// @route   GET /api/patient/doctors
// @desc    Get all doctors (public list)
// @access  Public
router.get('/doctors', (req, res, next) => {
    const fs = require('fs');
    fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] ROUTE_TRACE: GET /api/patient/doctors requested\n`);
    next();
}, patientController.getAllDoctorsPublic);

// @route   GET /api/patient/doctors/:id
// @desc    Get a single doctor by ID
// @access  Public
router.get('/doctors/:id', patientController.getDoctorById);

module.exports = router;
