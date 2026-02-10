const express = require('express');
const router = express.Router();
const {
    createPrescription,
    getPatientPrescriptions
} = require('../controllers/prescriptionController');
const { auth, isDoctor } = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Issue a prescription (Doctor only)
router.post('/', isDoctor, createPrescription);

// Get prescriptions for a patient (Patient or Doctor)
router.get('/patient/:patientId', getPatientPrescriptions);

module.exports = router;
