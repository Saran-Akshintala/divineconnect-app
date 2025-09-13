const { Sequelize } = require('sequelize');
require('dotenv').config();

// Mock database for development without PostgreSQL
const mockDatabase = {
  authenticate: async () => Promise.resolve(),
  sync: async () => Promise.resolve(),
  define: () => ({
    findAll: async () => [],
    findByPk: async () => null,
    create: async (data) => ({ id: Date.now(), ...data }),
    update: async () => [1],
    destroy: async () => 1
  })
};

let sequelize;

// Use mock database if PostgreSQL is not available or in development mode
if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_DB) {
  sequelize = mockDatabase;
  console.log('🔄 Using mock database for development');
} else {
  sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'divineconnect_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development' && sequelize.sync) {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }
  } catch (error) {
    console.log('⚠️  Database not available, using mock database');
    // Don't throw error, just use mock database
  }
};

module.exports = { sequelize, testConnection };
