const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', [
  body('bookingId').isUUID().withMessage('Valid booking ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive')
], verifyToken, paymentController.createOrder);

// @route   POST /api/v1/payments/verify
// @desc    Verify payment
// @access  Private
router.post('/verify', [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required'),
  body('bookingId').isUUID().withMessage('Valid booking ID is required')
], verifyToken, paymentController.verifyPayment);

// @route   POST /api/v1/payments/webhook
// @desc    Handle Razorpay webhook
// @access  Public
router.post('/webhook', paymentController.handleWebhook);

// @route   POST /api/v1/payments/refund
// @desc    Process refund
// @access  Private
router.post('/refund', [
  body('transactionId').isUUID().withMessage('Valid transaction ID is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be positive'),
  body('reason').trim().notEmpty().withMessage('Refund reason is required')
], verifyToken, paymentController.processRefund);

module.exports = router;
