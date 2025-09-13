const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'INR'
  },
  provider: {
    type: DataTypes.ENUM('razorpay', 'paytm', 'phonepe', 'gpay', 'cash'),
    allowNull: false,
    defaultValue: 'razorpay'
  },
  provider_transaction_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  provider_order_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  provider_payment_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  transaction_type: {
    type: DataTypes.ENUM('payment', 'refund', 'partial_refund'),
    allowNull: false,
    defaultValue: 'payment'
  },
  gateway_response: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  failure_reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  platform_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  gateway_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  net_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'transactions',
  indexes: [
    {
      fields: ['booking_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['provider']
    },
    {
      fields: ['provider_transaction_id']
    },
    {
      fields: ['transaction_type']
    }
  ]
});

module.exports = Transaction;
