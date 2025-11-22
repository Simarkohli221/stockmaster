const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};

// Load models
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.OtpToken = require("./OtpToken")(sequelize, Sequelize.DataTypes);
db.Product = require("./Product")(sequelize, Sequelize.DataTypes);
db.Category = require("./Category")(sequelize, Sequelize.DataTypes);

// Add more models later…

// Associations
db.Product.belongsTo(db.Category, {
  foreignKey: "category_id",
  as: "category",
});
db.Category.hasMany(db.Product, {
  foreignKey: "category_id",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
