const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[+]?[1-9]\d{1,14}$/
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  role: {
    type: DataTypes.ENUM('devotee', 'poojari'),
    allowNull: false,
    defaultValue: 'devotee'
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  firebase_uid: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [6, 6]
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fcm_token: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  indexes: [
    {
      fields: ['phone']
    },
    {
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['city', 'state']
    }
  ]
});

module.exports = User;
