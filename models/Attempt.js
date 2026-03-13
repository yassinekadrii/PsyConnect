/**
 * @file models/Attempt.js
 * @description Model for logging registration and login attempts ("They Try").
 */

const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['register', 'login', 'verify'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'fail'],
    required: true
  },
  message: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attempt', attemptSchema);
