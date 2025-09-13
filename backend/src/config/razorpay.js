const Razorpay = require('razorpay');
require('dotenv').config();

// Mock Razorpay for development
const mockRazorpay = {
  orders: {
    create: async (options) => {
      return {
        id: 'order_mock_' + Date.now(),
        entity: 'order',
        amount: options.amount,
        currency: options.currency || 'INR',
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };
    }
  },
  payments: {
    fetch: async (paymentId) => {
      return {
        id: paymentId,
        entity: 'payment',
        status: 'captured',
        amount: 100000,
        currency: 'INR'
      };
    }
  }
};

// Use mock Razorpay in development or when keys are not configured
if (process.env.NODE_ENV === 'development' || process.env.MOCK_PAYMENTS === 'true' || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_demo_key') {
  module.exports = mockRazorpay;
} else {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  module.exports = razorpay;
}
