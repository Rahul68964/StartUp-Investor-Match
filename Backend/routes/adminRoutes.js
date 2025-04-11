const express = require('express');
const Startup = require('../models/startup.js');
const Investor = require('../models/investor.js');
const router = express.Router();

router.get('/adminStartupList', async (req, res) => {

    try {
        const startups = await Startup.find({ status:'pending'});
        if (!startups) {
            return res.status(404).json({ success:false, message: 'No startups found' });
        }
        res.status(200).json({success:true,  startups });

    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message: error.message });
    }
});


router.get('/adminInvestorList', async (req, res) => {

    try {
        const investors = await Investor.find({ status:'pending'});
        if (!investors) {
            return res.status(404).json({ success:false, message: 'No startups found' });
        }
        res.status(200).json({success:true,  investors });

    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message: error.message });
    }
});


router.get('/reject/startup/:startup_id', async (req, res) => {
    try {
        const startUpid = req.params.startup_id;  // Correct way if passed via query

        if (!startUpid) {
            return res.status(400).json({ success: false, message: 'startup_id is required' });
        }

        const startup = await Startup.findById(startUpid);

        if (!startup) {
            return res.status(404).json({ success: false, message: 'Startup not found' });
        }

        const deletedStartup = await Startup.deleteOne({ _id: startUpid });

        res.status(200).json({ success: true, deletedStartup });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


router.get('/reject/investor/:investor_id', async (req, res) => {
    try {
        const investorId = req.params.investor_id;  // Correct way if passed via query

        if (!investorId) {
            return res.status(400).json({ success: false, message: 'id is required' });
        }

        const investor = await Investor.findById(investorId);

        if (!investor) {
            return res.status(404).json({ success: false, message: 'investor not found' });
        }

        const deletedInvestor = await Investor.deleteOne({ _id: investorId });

        res.status(200).json({ success: true, deletedInvestor });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


router.get('/approve/startup/:startup_id', async (req, res) => {

    try {
        const startUpid = req.params.startup_id;
        const startup = await Startup.find({ _id:startUpid});

        if (!startup) {
            return res.status(404).json({ success:false, message: 'No startups found' });
        }
        const newStartupData = await Startup.findByIdAndUpdate(startUpid, { status: 'approved' }, { new: true });


        if (!newStartupData) {
            return res.status(404).json({ success:false, message: 'No startups found' });
        }

        res.status(200).json({success:true,  newStartupData });

    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message: error.message });
    }
});

router.get('/approve/investor/:investor_id', async (req, res) => {

    try {
        const investorId = req.params.investor_id;
        const investor = await Investor.find({ _id:investorId});

        if (!investor) {
            return res.status(404).json({ success:false, message: 'No investor found' });
        }
        const newInvestorData = await Investor.findByIdAndUpdate(investorId, { status: 'approved' }, { new: true });


        if (!newInvestorData) {
            return res.status(404).json({ success:false, message: 'No investor found' });
        }

        res.status(200).json({success:true,  newInvestorData });

    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message: error.message });
    }
});

module.exports = router;