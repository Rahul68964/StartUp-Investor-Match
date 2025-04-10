const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

// Route imports
const startupRoutes = require('./routes/startup.js');
const investorRoutes = require('./routes/investor.js');
const pitchEventRoutes = require('./routes/pitchEvents.js');
const registorRoutes = require('./routes/registorRoutes.js');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/startups', startupRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/pitch-events', pitchEventRoutes);
app.use('/api/register', registorRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
