const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const OtpToken = sequelize.define(
  "otp_tokens",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

    user_id: { type: DataTypes.BIGINT, allowNull: false },

    token: { type: DataTypes.STRING, allowNull: false },

    purpose: {
      type: DataTypes.ENUM("password_reset", "login_otp"),
      allowNull: false,
    },

    expires_at: { type: DataTypes.DATE, allowNull: false },

    used: { type: DataTypes.TINYINT, defaultValue: 0 },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false,
    tableName: "otp_tokens",
  }
);

OtpToken.belongsTo(User, { foreignKey: "user_id" });

module.exports = OtpToken;
