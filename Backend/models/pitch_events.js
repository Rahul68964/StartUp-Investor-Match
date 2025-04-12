
const mongoose = require('mongoose');

const PitchEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true
  },
  startup_mail: {
    type: String,
    default: null
  },
  investor_mail: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  video_url: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('pitch_events', PitchEventSchema);
