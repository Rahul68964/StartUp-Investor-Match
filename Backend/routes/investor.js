const express = require('express');
const Investor = require('../models/investor.js');
const { v2: cloudinary } = require('cloudinary');
const router = express.Router();
const streamifier = require('streamifier');
const multer = require('multer');
const emailFinder = require('../middleware/emailFinder.js')
const InvestorRegistration = require('../models/investorRegistration.js')
const Startup = require('../models/startup.js');
const jwt = require('jsonwebtoken');
const pitchEventModel = require('../models/pitch_events.js');


const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname)
  }
})
const upload = multer({ storage: storage });
const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};



router.post('/kyc',
  upload.fields([
  { name: 'aadharCardPhoto', maxCount: 1 },
  { name: 'panCardPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Request body:", req.body);

    // Extract data from request body
    const {
      fullName,
      email,
      mobileNumber,
      panNumber,
      aadharNumber,
      address,
      country,
      pincode,
      minInvestment,
      maxInvestment
    } = req.body;

    if (!req.files || !req.files['aadharCardPhoto'] || !req.files['panCardPhoto']) {
      return res.status(400).json({
        success: false,
        message: 'Both Aadhar and PAN card photos are required'
      });
    }

    const aadharCardPhoto = req.files['aadharCardPhoto'][0];
    const panCardPhoto = req.files['panCardPhoto'][0];

    console.log("Starting Cloudinary upload...");

    // Upload images to Cloudinary
    try {
      const images = [aadharCardPhoto, panCardPhoto];
      let imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
          return result.secure_url;
        })
      );
      console.log("Cloudinary upload successful");

    
      const user = await InvestorRegistration.findOne({email});
      console.log(user);

      try {
        const investor = new Investor({
          userId:user._id,
          fullName,
          email,
          mobileNumber,
          panNumber,
          aadharNumber,
          address,
          country,
          pincode,
          aadharCardPhoto: imagesUrl[0],
          panCardPhoto: imagesUrl[1],
          minInvestment,
          maxInvestment,
        });

        const savedInvestor = await investor.save();
        console.log("Investor saved successfully");

        // Send success response and return to prevent further execution
        return res.status(201).json({
          success: true,
          message: 'Investor KYC saved',
          investor: savedInvestor
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({
          success: false,
          message: `Database error: ${dbError.message}`
        });
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary error:", cloudinaryError);
      return res.status(500).json({
        success: false,
        message: `Cloudinary error: ${cloudinaryError.message}`
      });
    }
  } catch (error) {
    console.error("General error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/isInvestorApproved', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'secret_key');
    const investorEmail = decoded.email;

    const investor = await Investor.findOne({ email: investorEmail });
    if (!investor) {
      return res.status(404).json({ success: false, message: 'Investor not found' });
    }
    if (investor.status === 'approved') {
      return res.status(200).json({ success: true, message: 'Investor is approved' });
    }
    return res.status(200).json({ success: false, message: 'Startup is not approved' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
})

router.get('/allStartups', async (req, res) => {
  try {
      allStartUps = await Startup.find({status:'approved'});
      res.status(200).json({success:true, startups:allStartUps});
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }

});

router.get('/getAllStartupsWhoPitched', async (req, res) => {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, 'secret_key');
      const investorEmail = decoded.email;

      const investor = await Investor.findOne({ email: investorEmail });
      if (!investor) {
          return res.status(404).json({ success: false, message: 'Investor not found' });
      }
      
      res.status(200).json({ success: true, startups: investor.StartUp_pitched });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/approvePitchedStartup/:startupEmail', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'secret_key');

    const investorEmail = typeof decoded === 'string' ? decoded : decoded.email;
    if (!investorEmail) {
      return res.status(401).json({ success: false, message: 'Invalid token payload: email not found' });
    }

    const startupEmail = req.params.startupEmail;

    // Find startup by email
    const startup = await Startup.findOne({ email: startupEmail });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    // Find investor by email
    const investor = await Investor.findOne({ email: investorEmail });
    if (!investor) {
      return res.status(404).json({ success: false, message: 'Investor not found' });
    }

    // Avoid duplicate entries
    const existingPitchInInvestor = investor.StartUp_pitched.find(p => p.email === startupEmail);
    if (!existingPitchInInvestor) {
      investor.StartUp_pitched.push({ email: startupEmail, status: 'approved' });
    } else {
      existingPitchInInvestor.status = 'approved';
    }

    const existingPitchInStartup = startup.Investor_Pitched?.find(p => p.email === investorEmail);
    if (!existingPitchInStartup) {
      if (!startup.Investor_Pitched) startup.Investor_Pitched = [];
      startup.Investor_Pitched.push({ email: investorEmail, status: 'approved' });
    } else {
      existingPitchInStartup.status = 'approved';
    }

    // Save both documents
    await investor.save();
    await startup.save();

    res.status(200).json({ success: true, message: 'Startup approved successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/rejectPitchedStartup/:startupEmail', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'secret_key');
    const investorEmail = decoded.email;

    if (!investorEmail) {
      return res.status(401).json({ success: false, message: 'Invalid token payload: email not found' });
    }

    const startupEmail = req.params.startupEmail;

    // Find startup by email
    const startup = await Startup.findOne({ email: startupEmail });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    // Find investor by email
    const investor = await Investor.findOne({ email: investorEmail });
    if (!investor) {
      return res.status(404).json({ success: false, message: 'Investor not found' });
    }

    
    investor.StartUp_pitched = investor.StartUp_pitched.map(pitch => {
      if (pitch.email === startupEmail) {
        return { ...pitch, status: 'rejected' };
      }
      return pitch;
    });

    // Update pitch status in startup's document
    startup.Investor_Pitched = (startup.Investor_Pitched || []).map(pitch => {
      if (pitch.email === investorEmail) {
        return { ...pitch, status: 'rejected' };
      }
      return pitch;
    });

    await investor.save();
    await startup.save();

    res.status(200).json({ success: true, message: 'Startup rejected successfully' });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/getAllStartupsWhoPitchedAndRejected', async (req, res) => {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, 'secret_key');
      const investorEmail = decoded.email;

      const investor = await Investor.findOne({ email: investorEmail });
      if (!investor) {
          return res.status(404).json({ success: false, message: 'Investor not found' });
      }
      const approvedStartups = investor.StartUp_pitched.filter(pitch => pitch.status === 'rejected');
      res.status(200).json({ success: true, startups: approvedStartups });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/getAllStartupsWhoPitchedAndApproved', async (req, res) => {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, 'secret_key');
      const investorEmail = decoded.email;

      const investor = await Investor.findOne({ email: investorEmail });
      if (!investor) {
          return res.status(404).json({ success: false, message: 'Investor not found' });
      }
      const approvedStartups = investor.StartUp_pitched.filter(pitch => pitch.status === 'approved');
      res.status(200).json({ success: true, startups: approvedStartups });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pitch/:startupEmail', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'secret_key');
    const investorEmail = decoded.email;

    if (!investorEmail) {
      return res.status(401).json({ success: false, message: 'Invalid token payload: email not found' });
    }

    const startupEmail = req.params.startupEmail;

    // Find startup by email
    const startup = await Startup.findOne({ email: startupEmail });
    console.log("Startup: ", startup);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    // Find investor by email
    const investor = await Investor.findOne({ email: investorEmail });
    console.log("Investor: ", investor);
    if (!investor) {
      return res.status(404).json({ success: false, message: 'Investor not found' });
    }

    
    investor.StartUp_pitched.push({ email: startupEmail, status: 'approved' });

    if (!startup.Investor_Pitched) startup.Investor_Pitched = [];
    
    startup.Investor_Pitched.push({ email: investorEmail, status: 'approved' });

    // Save both documents
    await investor.save();
    await startup.save();

    res.status(200).json({ success: true, message: 'Startup pitched successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false,rahul:true, message: error.message });
  }
})
  
router.get('/getAllPitchEvents', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'secret_key');
    const investorEmail = decoded.email;


    const pitchEvents = await pitchEventModel.find({investor_mail: investorEmail});
    if (!pitchEvents) {
      return res.status(404).json({ success: false, message: 'No pitch events found' });
    }
    res.status(200).json({ success: true, pitchEvents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
