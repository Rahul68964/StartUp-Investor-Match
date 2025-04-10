const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  pitchDeckUrl: String,
  industry: {
    type: String,
    required: true
  },
  fundingNeeded: {
    type: Number,
    required: true
  },
  stage: {
    type: String,
    enum: ['seed', 'series_a', 'series_b', 'series_c', 'growth'],
    required: true
  },
  tractionMetrics: {
    revenue: Number,
    users: Number,
    growthRate: Number
  },
  teamSize: Number,
  location: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Startup', startupSchema);