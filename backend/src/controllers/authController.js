const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const admin = require('../config/firebase');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Send OTP to phone number
// @route   POST /api/v1/auth/login
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // In development, we'll mock the OTP sending
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          phone,
          verificationId: 'mock_verification_id_' + Date.now(),
          mockOTP: '123456' // Only for development testing
        }
      });
    }

    // In production, integrate with Firebase Auth to send actual OTP
    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        verificationId: 'verification_id_from_firebase'
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP'
    });
  }
};

// @desc    Verify OTP and login/register user
// @route   POST /api/v1/auth/verify
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, verificationId, name } = req.body;

    if (!phone || !otp || !verificationId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and verification ID are required'
      });
    }

    // In development, mock OTP verification
    if (process.env.NODE_ENV === 'development') {
      if (otp !== '123456') {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }
    } else {
      // In production, verify OTP with Firebase
      try {
        const decodedToken = await admin.auth().verifyIdToken(req.body.firebaseToken);
        if (decodedToken.phone_number !== phone) {
          return res.status(400).json({
            success: false,
            message: 'Phone number verification failed'
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Firebase token'
        });
      }
    }

    // Find or create user
    let user = await User.findOne({ where: { phone } });
    
    if (!user) {
      // Auto-register new user
      user = await User.create({
        name: name || 'User',
        phone,
        role: 'devotee',
        firebaseUid: process.env.NODE_ENV === 'development' ? 'mock_uid_' + Date.now() : null,
        isVerified: true
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isNewUser: !user.email
        },
        token
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
};

// @desc    Register new user (alternative method)
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, phone, email, role, firebaseToken } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      phone,
      email,
      role: role || 'devotee',
      firebaseUid: process.env.NODE_ENV === 'development' ? 'mock_uid_' + Date.now() : null,
      isVerified: true
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, dateOfBirth, gender, address } = req.body;

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (address) user.address = address;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  sendOTP,
  verifyOTP,
  logout,
  getProfile,
  updateProfile
};
