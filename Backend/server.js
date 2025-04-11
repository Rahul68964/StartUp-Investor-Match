const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const connectCloudinary = require('./config/cloudinary');
const startupRoutes = require('./routes/startup.js');
const investorRoutes = require('./routes/investor.js');
const pitchEventRoutes = require('./routes/pitchEvents.js');
const registorRoutes = require('./routes/registorRoutes.js');
const loginRoutes = require('./routes/loginRoute.js');
const adminRoutes = require('./routes/adminRoutes.js');


dotenv.config();
const app = express();
connectDB();
connectCloudinary()
  .then(() => console.log('Cloudinary connected'))
app.use(cors());
app.use(express.json());


app.use('/api/startups', startupRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/pitch-events', pitchEventRoutes);
app.use('/api/register', registorRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/admin', adminRoutes);





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
