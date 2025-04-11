const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret_key';

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token found, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.email = decoded.email; 
    console.log("Decoded email:", req.email); 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateUser;
