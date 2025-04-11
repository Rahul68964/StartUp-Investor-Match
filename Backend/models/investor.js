const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestorRegistration',  
    required: true
  },
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  mobileNumber: {
    type: String,
    required: true
  },
  panNumber: {
    type: String,
    required: true,
    unique: true
  },
  aadharNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  aadharCardPhoto: {
    type: String, // You can store file path or URL
    required: true
  },
  panCardPhoto: {
    type: String, // You can store file path or URL
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
 
  minInvestment: Number,
  maxInvestment: Number,
  
  StartUp_pitched: {
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


module.exports = mongoose.model('Investor', investorSchema);