const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "users",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

    email: { type: DataTypes.STRING, allowNull: false, unique: true },

    password_hash: { type: DataTypes.STRING, allowNull: false },

    name: { type: DataTypes.STRING },

    role: { type: DataTypes.STRING, allowNull: false }, // admin, manager, staff

    phone: { type: DataTypes.STRING },

    is_active: { type: DataTypes.TINYINT, defaultValue: 1 },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

    updated_at: { type: DataTypes.DATE },

    deleted_at: { type: DataTypes.DATE },
  },
  {
    timestamps: false,
    tableName: "users",
  }
);

module.exports = User;
