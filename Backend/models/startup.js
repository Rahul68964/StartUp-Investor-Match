const mongoose = require('mongoose');
const StartupRegistration = require('../models/startupRegistration.js');


const startupSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorRegistration',  
      required: true
    },
  company: {
    type: String,
  },
  email: {
    type: String,
  },
  founded: {
    type: Number,
    required: true
  },
  headquarters: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  founder: {
    type: String,
    required: true
  },
  investors: {
    type: String,
  },
  amount: {
    type: Number,
    required: true
  },
  certificateOfIncorporation: {
    type: String,
  },
  panCard: {
    type: String,
  },
  aadharCard: {
    type: String,
  },
  investorAgreement: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  Investor_Pitched: {
    type: [
      {
        email: { type: String},
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
      }
    ],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Startup', startupSchema);
