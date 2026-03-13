const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

// All appointment routes require authentication
router.use(auth);

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Patient
router.post('/', async (req, res) => {
    try {
        const { doctorId, startTime, endTime, type, notes } = req.body;

        const appointment = new Appointment({
            patient: req.user.id,
            doctor: doctorId,
            startTime,
            endTime,
            type,
            notes
        });

        await appointment.save();
        res.status(201).json({ success: true, appointment });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la réservation' });
    }
});

// @route   GET /api/appointments/me
// @desc    Get my appointments (as patient or doctor)
// @access  All
router.get('/me', async (req, res) => {
    try {
        const filter = req.user.role === 'doctor' ? { doctor: req.user.id } : { patient: req.user.id };
        const appointments = await Appointment.find(filter)
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName specialty')
            .sort({ startTime: 1 });

        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des rendez-vous' });
    }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Doctor
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
        }

        res.json({ success: true, appointment });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
    }
});

module.exports = router;
