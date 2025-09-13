const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', verifyToken, userController.getProfile);

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('pincode').optional().isLength({ min: 6, max: 6 }).withMessage('Valid pincode is required')
], verifyToken, userController.updateProfile);

// @route   POST /api/v1/users/upload-avatar
// @desc    Upload profile image
// @access  Private
router.post('/upload-avatar', verifyToken, userController.uploadAvatar);

// @route   PUT /api/v1/users/fcm-token
// @desc    Update FCM token for notifications
// @access  Private
router.put('/fcm-token', [
  body('fcmToken').notEmpty().withMessage('FCM token is required')
], verifyToken, userController.updateFcmToken);

module.exports = router;
