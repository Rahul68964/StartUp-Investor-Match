const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const connectCloudinary = require('./config/cloudinary');
const startupRoutes = require('./routes/startup.js');
const investorRoutes = require('./routes/investor.js');
const registorRoutes = require('./routes/registorRoutes.js');
const loginRoutes = require('./routes/loginRoute.js');
const adminRoutes = require('./routes/adminRoutes.js');
const auth_status = require('./routes/auth_status.js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
connectDB();
connectCloudinary()
  .then(() => console.log('Cloudinary connected'))
app.use(cors(
  {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
));
app.use(express.json());
app.use(cookieParser());


app.use('/api/startups', startupRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/register', registorRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/getEmail', auth_status);





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
