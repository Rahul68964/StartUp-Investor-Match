const express = require('express');
const Investor = require('../models/investor.js');

const router = express.Router();

// Get all investors
router.get('/', async (req, res) => {
  try {
    const investors = await Investor.find();
    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get investor by userId
router.get('/:userId', async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.params.userId });
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }
    res.json(investor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create investor profile
router.post('/', async (req, res) => {
  const investor = new Investor({
    userId: req.body.userId,
    firmName: req.body.firmName,
    investmentFocus: req.body.investmentFocus,
    preferredStages: req.body.preferredStages,
    minInvestment: req.body.minInvestment,
    maxInvestment: req.body.maxInvestment,
    portfolioSize: req.body.portfolioSize
  });

  try {
    const newInvestor = await investor.save();
    res.status(201).json(newInvestor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update investor profile
router.patch('/:userId', async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.params.userId });
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    Object.keys(req.body).forEach(key => {
      investor[key] = req.body[key];
    });

    const updatedInvestor = await investor.save();
    res.json(updatedInvestor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
