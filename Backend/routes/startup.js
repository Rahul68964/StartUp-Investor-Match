const express = require('express');
const Startup = require('../models/startup.js');

const router = express.Router();

// Get all startups
router.get('/', async (req, res) => {
  try {
    const startups = await Startup.find();
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get startup by userId
router.get('/:userId', async (req, res) => {
  try {
    const startup = await Startup.findOne({ userId: req.params.userId });
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create startup profile
router.post('/', async (req, res) => {
  const startup = new Startup({
    userId: req.body.userId,
    companyName: req.body.companyName,
    pitchDeckUrl: req.body.pitchDeckUrl,
    industry: req.body.industry,
    fundingNeeded: req.body.fundingNeeded,
    stage: req.body.stage,
    tractionMetrics: req.body.tractionMetrics,
    teamSize: req.body.teamSize,
    location: req.body.location
  });

  try {
    const newStartup = await startup.save();
    res.status(201).json(newStartup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update startup profile
router.patch('/:userId', async (req, res) => {
  try {
    const startup = await Startup.findOne({ userId: req.params.userId });
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    Object.keys(req.body).forEach(key => {
      startup[key] = req.body[key];
    });

    const updatedStartup = await startup.save();
    res.json(updatedStartup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
