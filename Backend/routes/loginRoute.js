const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Investor = require('../models/investorRegistration.js');
const Startup = require('../models/startupRegistration.js');
const router = express.Router();
const JWT_SECRET = 'secret_key';

router.post('/', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let existingUser;
    if (userType === 'investor') {
      existingUser = await Investor.findOne({ email });
    } else if (userType === 'startup') {
      existingUser = await Startup.findOne({ email });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    if (!existingUser) {
      return res.status(409).json({ success: false, message: 'User not exists' });
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: existingUser.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax"
    });


    res.status(201).json({
      success: true,
      message: `Logined successfully`,
      token,
      Logined_User: {
        id: existingUser._id,
        email: existingUser.email,
        userType,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
