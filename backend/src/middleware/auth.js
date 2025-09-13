const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');
const { User } = require('../models');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Verify Firebase token (for OTP verification)
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No Firebase token provided.' 
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid Firebase token.' 
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please authenticate.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Account verification required.' 
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyFirebaseToken,
  authorize,
  requireVerification
};
