const express = require('express');
const router = express.Router();
const { register, sendOTP, verifyOTP, logout, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes - Firebase OTP Authentication
router.post('/login', sendOTP);           // Step 1: Send OTP to phone
router.post('/verify', verifyOTP);        // Step 2: Verify OTP and login/register
router.post('/register', register);       // Alternative registration

// Protected routes
router.use(verifyToken);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
