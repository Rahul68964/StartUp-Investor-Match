const express = require('express');
const Investor = require('../models/investor.js');
const { v2: cloudinary } = require('cloudinary');
const router = express.Router();
const streamifier = require('streamifier');
const multer = require('multer');
const emailFinder = require('../middleware/emailFinder.js')
const InvestorRegistration = require('../models/investorRegistration.js')

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


module.exports = router;
