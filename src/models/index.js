const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.COCKROACH_URI, {
  dialect: 'postgres',
  logging: console.log,
});

// Import models
const User = require('./User')(sequelize);
const Product = require('./Product')(sequelize);
const Listing = require('./Listing')(sequelize);

// Define associations
User.hasMany(Listing, { foreignKey: 'userId' });
Listing.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Listing, { foreignKey: 'productId' });
Listing.belongsTo(Product, { foreignKey: 'productId' });

// Export everything
module.exports = {
  sequelize,
  User,
  Product,
  Listing,
};