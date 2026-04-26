/**
 * @file Prescription.js
 * @description Mongoose schema for medical prescriptions issued by doctors to patients.
 */

const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pdf: {
        type: String,
        default: ''
    },
    medicines: [{
        name: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        notes: {
            type: String,
            default: ''
        }
    }],
    exercises: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        frequency: {
            type: String,
            default: ''
        },
        duration: {
            type: String,
            default: ''
        }
    }],
    instructions: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
