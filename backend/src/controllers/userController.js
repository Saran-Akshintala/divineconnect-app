const { validationResult } = require('express-validator');
const { User, PoojariProfile } = require('../models');

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: PoojariProfile,
        as: 'poojariProfile'
      }],
      attributes: { exclude: ['firebase_uid'] }
    });

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      dateOfBirth, 
      gender, 
      address, 
      city, 
      state, 
      pincode,
      latitude,
      longitude
    } = req.body;
    const user = req.user;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (dateOfBirth) updateData.date_of_birth = dateOfBirth;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;
    if (latitude) updateData.latitude = latitude;
    if (longitude) updateData.longitude = longitude;

    await user.update(updateData);

    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: PoojariProfile,
        as: 'poojariProfile'
      }],
      attributes: { exclude: ['firebase_uid'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/v1/users/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    // This would typically handle file upload using multer
    // For now, we'll just return a placeholder response
    res.json({
      success: true,
      message: 'Avatar upload endpoint - implementation pending',
      data: {
        profileImage: 'https://example.com/avatar.jpg'
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar'
    });
  }
};

// @desc    Update FCM token for notifications
// @route   PUT /api/v1/users/fcm-token
// @access  Private
const updateFcmToken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fcmToken } = req.body;
    const user = req.user;

    await user.update({ fcm_token: fcmToken });

    res.json({
      success: true,
      message: 'FCM token updated successfully'
    });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating FCM token'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateFcmToken
};
