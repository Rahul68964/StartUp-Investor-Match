const express = require('express');
const Startup = require('../models/startup.js');
const { v2: cloudinary } = require('cloudinary');
const router = express.Router();
const streamifier = require('streamifier');
const multer = require('multer');
const emailFinder = require('../middleware/emailFinder.js')
const startupRegistration = require('../models/startupRegistration.js')
const Investor = require('../models/investor.js');






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




router.post('/addStartup',
  upload.fields([
  { name: 'certificateOfIncorporation', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'investorAgreement', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      email,
      company,
      founded,
      headquarters,
      sector,
      description,
      founder,
      investors,
      amount
    } = req.body;
    
    const aadharCardPhoto = req.files['aadharCard'][0];
    const panCardPhoto = req.files['panCard'][0];
    const certificateOfIncorporationPhoto = req.files['certificateOfIncorporation'][0];
    const investorAgreementPhoto = req.files['investorAgreement'][0];

    try {
          const images = [aadharCardPhoto, panCardPhoto, certificateOfIncorporationPhoto, investorAgreementPhoto];
          let imagesUrl = await Promise.all(
            images.map(async (item) => {
              let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
              return result.secure_url;
            })
          );
          console.log("Cloudinary upload successful");

         
          const user = await startupRegistration.findOne({email});
          
          try {
            const startup = new Startup({
              userId: user._id,
              email,
              company,
              founded,
              headquarters,
              sector,
              description,
              founder,
              investors,
              amount,
              aadharCard: imagesUrl[0],
              panCard: imagesUrl[1],
              certificateOfIncorporation: imagesUrl[2],
              investorAgreement: imagesUrl[3]
            });
    
            const savedStartup = await startup.save();
            console.log("Strartup saved successfully");

            return res.status(201).json({
              success: true,
              message: 'Startup data saved',
              startup: savedStartup
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



router.get('/allInvestors', async (req, res) => {
  try {
    const allInvestors = await Investor.find({status:'approved'});
    return res.status(200).json({success: true, investors:allInvestors });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
})




router.post('/pitch/:investor_id', async (req, res)=>{
  try {

    const { investor_id } = req.params;
    const { startupEmail } = req.body;

    const investor = await Investor.findById(investor_id);
    if (!investor) {
      return res.status(404).json({ success: false, message: 'Investor not found' });
    }

    const startup = await Startup.findById({email:startupEmail});
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    investor.StartUp_pitched.push(startup.email);
    await investor.save();

    return res.status(200).json({ success: true, message: 'Startup pitched successfully' });
    
  } catch (error) {
    
  }
})



module.exports = router;
