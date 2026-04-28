const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ALLOWED_EMAIL_MESSAGE, isAllowedInstitutionEmail } = require('../utils/emailDomain');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!isAllowedInstitutionEmail(user.email)) {
      return res.status(401).json({ message: ALLOWED_EMAIL_MESSAGE });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
