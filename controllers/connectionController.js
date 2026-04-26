const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Request a connection (Patient to Doctor)
// @route   POST /api/connections/request
// @access  Patient
exports.requestConnection = async (req, res) => {
    try {
        const { doctorId } = req.body;
        const patientId = req.user.id;

        if (req.user.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Seuls les patients peuvent demander une connexion' });
        }

        // Check if doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Médecin non trouvé' });
        }

        // Check if connection already exists
        let connection = await Connection.findOne({ patient: patientId, doctor: doctorId });
        if (connection) {
            return res.status(400).json({ success: false, message: 'Une demande existe déjà ou vous êtes déjà connecté/bloqué' });
        }

        connection = new Connection({
            patient: patientId,
            doctor: doctorId,
            status: 'pending',
            requestedBy: 'patient'
        });

        await connection.save();

        res.status(201).json({ success: true, message: 'Demande de connexion envoyée', connection });
    } catch (error) {
        console.error('Error requesting connection:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Accept a connection (Doctor only)
// @route   PUT /api/connections/accept/:patientId
// @access  Doctor
exports.acceptConnection = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Seuls les médecins peuvent accepter une connexion' });
        }

        const connection = await Connection.findOne({ patient: patientId, doctor: doctorId });
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Demande non trouvée' });
        }

        connection.status = 'accepted';
        await connection.save();

        res.json({ success: true, message: 'Connexion acceptée', connection });
    } catch (error) {
        console.error('Error accepting connection:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Block a patient (Doctor only)
// @route   PUT /api/connections/block/:patientId
// @access  Doctor
exports.blockConnection = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Seuls les médecins peuvent bloquer un patient' });
        }

        let connection = await Connection.findOne({ patient: patientId, doctor: doctorId });
        if (!connection) {
            // Create a blocked connection even if none existed
            connection = new Connection({
                patient: patientId,
                doctor: doctorId,
                status: 'blocked',
                requestedBy: 'doctor'
            });
        } else {
            connection.status = 'blocked';
        }

        await connection.save();

        res.json({ success: true, message: 'Patient bloqué', connection });
    } catch (error) {
        console.error('Error blocking connection:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Get all connections for current user
// @route   GET /api/connections
// @access  Private
exports.getConnections = async (req, res) => {
    try {
        const query = req.user.role === 'doctor' ? { doctor: req.user.id } : { patient: req.user.id };
        const connections = await Connection.find(query)
            .populate('patient', 'firstName lastName email profilePicture')
            .populate('doctor', 'firstName lastName email specialty profilePicture');

        res.json({ success: true, connections });
    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
