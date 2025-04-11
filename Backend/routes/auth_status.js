const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')

router.get('/', (req, res) => {

    const token = req.cookies.token;

    if (!token) {
        return res.json({ loggedIn: false });
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.json({ loggedIn: false });
        }
        
        res.json({ 
                    loggedIn: true,
                    email: decoded.email 
                });
    });
});

module.exports = router;