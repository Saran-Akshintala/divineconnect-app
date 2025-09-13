const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PoojariProfile = sequelize.define('PoojariProfile', {
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
    },
    onDelete: 'CASCADE'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  specializations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  pricing_per_hour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  pricing_per_service: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  video_intro_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificates: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  availability_schedule: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      monday: { available: true, slots: [] },
      tuesday: { available: true, slots: [] },
      wednesday: { available: true, slots: [] },
      thursday: { available: true, slots: [] },
      friday: { available: true, slots: [] },
      saturday: { available: true, slots: [] },
      sunday: { available: true, slots: [] }
    }
  },
  blocked_dates: {
    type: DataTypes.ARRAY(DataTypes.DATEONLY),
    allowNull: false,
    defaultValue: []
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  bank_account_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank_ifsc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank_account_holder: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'poojari_profiles',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['is_verified']
    },
    {
      fields: ['featured']
    },
    {
      fields: ['languages']
    },
    {
      fields: ['specializations']
    }
  ]
});

module.exports = PoojariProfile;
