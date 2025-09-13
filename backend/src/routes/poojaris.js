const express = require('express');
const { body, query } = require('express-validator');
const poojariController = require('../controllers/poojariController');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/poojaris
// @desc    Get all poojaris with filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  query('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  query('language').optional().trim().notEmpty().withMessage('Language cannot be empty'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  query('specialization').optional().trim().notEmpty().withMessage('Specialization cannot be empty')
], poojariController.getAllPoojaris);

// @route   GET /api/v1/poojaris/featured
// @desc    Get featured poojaris
// @access  Public
router.get('/featured', poojariController.getFeaturedPoojaris);

// @route   GET /api/v1/poojaris/:id
// @desc    Get poojari profile by ID
// @access  Public
router.get('/:id', poojariController.getPoojariById);

// @route   GET /api/v1/poojaris/:id/availability
// @desc    Get poojari availability
// @access  Public
router.get('/:id/availability', [
  query('date').optional().isISO8601().withMessage('Valid date is required'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2023 }).withMessage('Year must be valid')
], poojariController.getAvailability);

// @route   PUT /api/v1/poojaris/profile
// @desc    Update poojari profile
// @access  Private (Poojari only)
router.put('/profile', [
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('experienceYears').optional().isInt({ min: 0, max: 100 }).withMessage('Experience must be between 0 and 100'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('specializations').optional().isArray().withMessage('Specializations must be an array'),
  body('pricingPerHour').optional().isFloat({ min: 0 }).withMessage('Pricing must be positive'),
  body('pricingPerService').optional().isFloat({ min: 0 }).withMessage('Pricing must be positive')
], verifyToken, authorize('poojari'), poojariController.updateProfile);

// @route   PUT /api/v1/poojaris/availability
// @desc    Update poojari availability schedule
// @access  Private (Poojari only)
router.put('/availability', [
  body('schedule').isObject().withMessage('Schedule must be an object'),
  body('blockedDates').optional().isArray().withMessage('Blocked dates must be an array')
], verifyToken, authorize('poojari'), poojariController.updateAvailability);

// @route   POST /api/v1/poojaris/upload-video
// @desc    Upload video introduction
// @access  Private (Poojari only)
router.post('/upload-video', verifyToken, authorize('poojari'), poojariController.uploadVideo);

// @route   GET /api/v1/poojaris/:id/reviews
// @desc    Get poojari reviews
// @access  Public
router.get('/:id/reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], poojariController.getReviews);

module.exports = router;
