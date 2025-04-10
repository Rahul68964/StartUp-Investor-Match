const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  firmName: {
    type: String,
    required: true
  },
  investmentFocus: [{
    type: String
  }],
  preferredStages: [{
    type: String,
    enum: ['seed', 'series_a', 'series_b', 'series_c', 'growth']
  }],
  minInvestment: Number,
  maxInvestment: Number,
  portfolioSize: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Investor', investorSchema);