/**
 * @file Mood.js
 * @description Mongoose schema for patient daily mood tracking.
 */

const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true // e.g., -2 to +2
    },
    label: {
        type: String,
        required: true // e.g., 'Super', 'Triste'
    },
    emoji: {
        type: String,
        required: true
    },
    note: {
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

// Ensure a patient can logs moods, and we can query by date
moodSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('Mood', moodSchema);
