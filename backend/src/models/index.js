const { sequelize } = require('../config/database');

// Mock models for development
const mockModel = {
  findAll: async () => [],
  findByPk: async () => null,
  findOne: async () => null,
  create: async (data) => ({ id: Date.now(), ...data }),
  update: async () => [1],
  destroy: async () => 1,
  hasOne: () => {},
  hasMany: () => {},
  belongsTo: () => {}
};

let User, PoojariProfile, Booking, Review, Transaction;

// Use mock models if using mock database
if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_DB) {
  User = mockModel;
  PoojariProfile = mockModel;
  Booking = mockModel;
  Review = mockModel;
  Transaction = mockModel;
  console.log('🔄 Using mock models for development');
} else {
  User = require('./User')(sequelize);
  PoojariProfile = require('./PoojariProfile')(sequelize);
  Booking = require('./Booking')(sequelize);
  Review = require('./Review')(sequelize);
  Transaction = require('./Transaction')(sequelize);

  // Define associations
  User.hasOne(PoojariProfile, { foreignKey: 'userId', as: 'poojariProfile' });
  PoojariProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(Booking, { foreignKey: 'userId', as: 'userBookings' });
  User.hasMany(Booking, { foreignKey: 'poojariId', as: 'poojariBookings' });
  Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Booking.belongsTo(User, { foreignKey: 'poojariId', as: 'poojari' });

  User.hasMany(Review, { foreignKey: 'userId', as: 'userReviews' });
  User.hasMany(Review, { foreignKey: 'poojariId', as: 'poojariReviews' });
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Review.belongsTo(User, { foreignKey: 'poojariId', as: 'poojari' });
  Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

  Booking.hasMany(Transaction, { foreignKey: 'bookingId', as: 'transactions' });
  Transaction.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
}

module.exports = {
  sequelize,
  User,
  PoojariProfile,
  Booking,
  Review,
  Transaction
};
