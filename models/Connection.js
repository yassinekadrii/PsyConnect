const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    },
    requestedBy: {
        type: String,
        enum: ['patient', 'doctor'],
        default: 'patient'
    }
}, {
    timestamps: true
});

// Ensure unique connection between same patient and doctor
connectionSchema.index({ patient: 1, doctor: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
