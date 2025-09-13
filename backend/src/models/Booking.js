const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  poojari_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  service_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  scheduled_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration_hours: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
    defaultValue: 1.0
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  special_requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  materials_required: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  materials_provided_by: {
    type: DataTypes.ENUM('devotee', 'poojari', 'both'),
    allowNull: false,
    defaultValue: 'devotee'
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternate_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  booking_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  poojari_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelled_by: {
    type: DataTypes.ENUM('user', 'poojari', 'admin'),
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'bookings',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['poojari_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['scheduled_date']
    },
    {
      fields: ['city', 'state']
    }
  ]
});

module.exports = Booking;
