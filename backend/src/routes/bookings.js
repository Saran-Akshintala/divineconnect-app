const express = require('express');
const { body, query } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/bookings
// @desc    Create new booking
// @access  Private
router.post('/', [
  body('poojariId').isUUID().withMessage('Valid Poojari ID is required'),
  body('serviceType').trim().notEmpty().withMessage('Service type is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('durationHours').isFloat({ min: 0.5, max: 12 }).withMessage('Duration must be between 0.5 and 12 hours'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').isLength({ min: 6, max: 6 }).withMessage('Valid pincode is required'),
  body('contactPhone').isMobilePhone().withMessage('Valid contact phone is required')
], verifyToken, bookingController.createBooking);

// @route   GET /api/v1/bookings
// @desc    Get user bookings
// @access  Private
router.get('/', [
  query('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], verifyToken, bookingController.getUserBookings);

// @route   GET /api/v1/bookings/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', verifyToken, bookingController.getBookingById);

// @route   PUT /api/v1/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', [
  body('status').isIn(['confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], verifyToken, bookingController.updateBookingStatus);

// @route   PUT /api/v1/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', [
  body('reason').trim().notEmpty().withMessage('Cancellation reason is required')
], verifyToken, bookingController.cancelBooking);

// @route   GET /api/v1/bookings/poojari/dashboard
// @desc    Get poojari dashboard data
// @access  Private (Poojari only)
router.get('/poojari/dashboard', verifyToken, authorize('poojari'), bookingController.getPoojariDashboard);

module.exports = router;
