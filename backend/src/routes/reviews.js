const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/reviews
// @desc    Create new review
// @access  Private
router.post('/', [
  body('bookingId').isUUID().withMessage('Valid booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('serviceQuality').optional().isInt({ min: 1, max: 5 }).withMessage('Service quality rating must be between 1 and 5'),
  body('punctuality').optional().isInt({ min: 1, max: 5 }).withMessage('Punctuality rating must be between 1 and 5'),
  body('communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('wouldRecommend').optional().isBoolean().withMessage('Would recommend must be boolean')
], verifyToken, reviewController.createReview);

// @route   GET /api/v1/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', reviewController.getReviewById);

// @route   PUT /api/v1/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('serviceQuality').optional().isInt({ min: 1, max: 5 }).withMessage('Service quality rating must be between 1 and 5'),
  body('punctuality').optional().isInt({ min: 1, max: 5 }).withMessage('Punctuality rating must be between 1 and 5'),
  body('communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('wouldRecommend').optional().isBoolean().withMessage('Would recommend must be boolean')
], verifyToken, reviewController.updateReview);

// @route   DELETE /api/v1/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
