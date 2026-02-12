/**
 * @file routes/patient.js
 * @description Patient-specific routes, such as public doctor listings.
 */

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { auth } = require('../middleware/auth');

// Public route to view doctors (or protected if you prefer)
// Using auth middleware optionally to allow public viewing but better tracking?
// For now, let's make it public or require patient login. 
// The user request implies patients see this, so let's protect it or make it public.
// Making it public for "Find a Doctor" page seems appropriate for a landing page feature,
// but for "My Doctors" chat it needs auth.
// Let's make the list public for now so visitors can see doctors.

router.get('/doctors', patientController.getAllDoctorsPublic);

module.exports = router;
