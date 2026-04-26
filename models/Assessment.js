/**
 * @file models/Assessment.js
 * @description Mongoose schema for preliminary patient self-assessments.
 */

const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Optional: selected doctor to review
    },
    responses: [{
        question: { type: String, required: true },
        answer: { type: String, required: true },
        score: { type: Number, default: 0 }
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['normal', 'mild', 'moderate', 'severe'],
        default: 'normal'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema);
