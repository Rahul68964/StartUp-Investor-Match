const express = require('express');
const PitchEvent = require('../models/pitchEvent.js');

const router = express.Router();

// Get all pitch events
router.get('/', async (req, res) => {
  try {
    const events = await PitchEvent.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pitch events for a specific startup
router.get('/startup/:startupId', async (req, res) => {
  try {
    const events = await PitchEvent.find({ startupId: req.params.startupId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pitch events for a specific investor
router.get('/investor/:investorId', async (req, res) => {
  try {
    const events = await PitchEvent.find({ investorIds: req.params.investorId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new pitch event
router.post('/', async (req, res) => {
  const pitchEvent = new PitchEvent({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    startupId: req.body.startupId,
    investorIds: req.body.investorIds,
    meetingUrl: req.body.meetingUrl
  });

  try {
    const newEvent = await pitchEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a pitch event
router.patch('/:id', async (req, res) => {
  try {
    const event = await PitchEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    Object.keys(req.body).forEach(key => {
      event[key] = req.body[key];
    });

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel a pitch event
router.patch('/:id/cancel', async (req, res) => {
  try {
    const event = await PitchEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'cancelled';
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
