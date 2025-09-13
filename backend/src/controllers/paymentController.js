const crypto = require('crypto');
const { validationResult } = require('express-validator');
const razorpay = require('../config/razorpay');
const { Booking, Transaction } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Create Razorpay order
// @route   POST /api/v1/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId, amount } = req.body;
    const userId = req.user.id;

    // Verify booking belongs to user
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        user_id: userId,
        status: 'pending'
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not eligible for payment'
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId,
        userId
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Update transaction record
    await Transaction.update({
      provider_order_id: order.id,
      status: 'processing'
    }, {
      where: { booking_id: bookingId }
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment order'
    });
  }
};

// @desc    Verify payment
// @route   POST /api/v1/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId
    } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update booking and transaction
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.update({
      payment_status: 'paid',
      status: 'confirmed',
      confirmed_at: new Date()
    }, { transaction });

    await Transaction.update({
      provider_payment_id: razorpayPaymentId,
      status: 'completed',
      processed_at: new Date(),
      gateway_response: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature
      }
    }, {
      where: { booking_id: bookingId },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        bookingId,
        paymentStatus: 'completed'
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

// @desc    Handle Razorpay webhook
// @route   POST /api/v1/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const { event, payload } = req.body;

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing webhook'
    });
  }
};

// Helper function to handle payment captured
const handlePaymentCaptured = async (payment) => {
  try {
    await Transaction.update({
      status: 'completed',
      processed_at: new Date(),
      gateway_response: payment
    }, {
      where: { provider_payment_id: payment.id }
    });
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
};

// Helper function to handle payment failed
const handlePaymentFailed = async (payment) => {
  try {
    await Transaction.update({
      status: 'failed',
      failure_reason: payment.error_description,
      gateway_response: payment
    }, {
      where: { provider_payment_id: payment.id }
    });
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
};

// @desc    Process refund
// @route   POST /api/v1/payments/refund
// @access  Private
const processRefund = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { transactionId, amount, reason } = req.body;

    const transactionRecord = await Transaction.findByPk(transactionId);
    if (!transactionRecord || transactionRecord.status !== 'completed') {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or not eligible for refund'
      });
    }

    const refundAmount = amount || transactionRecord.amount;

    // Create refund with Razorpay
    const refund = await razorpay.payments.refund(transactionRecord.provider_payment_id, {
      amount: Math.round(refundAmount * 100),
      notes: {
        reason,
        transactionId
      }
    });

    // Create refund transaction record
    await Transaction.create({
      booking_id: transactionRecord.booking_id,
      amount: refundAmount,
      currency: transactionRecord.currency,
      provider: 'razorpay',
      provider_transaction_id: refund.id,
      status: 'completed',
      transaction_type: 'refund',
      processed_at: new Date(),
      gateway_response: refund
    }, { transaction });

    // Update original transaction
    await transactionRecord.update({
      status: 'refunded',
      refunded_at: new Date(),
      refund_amount: refundAmount
    }, { transaction });

    // Update booking status
    await Booking.update({
      payment_status: 'refunded',
      status: 'refunded'
    }, {
      where: { id: transactionRecord.booking_id },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  processRefund
};
