module.exports = (sequelize, DataTypes) => {
    const OtpToken = sequelize.define(
      "OtpToken",
      {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT, allowNull: false },
        token: { type: DataTypes.STRING, allowNull: false },
        purpose: { type: DataTypes.ENUM("password_reset", "login_otp"), allowNull: false },
        expires_at: { type: DataTypes.DATE, allowNull: false },
        used: { type: DataTypes.TINYINT, defaultValue: 0 },
        created_at: DataTypes.DATE
      },
      {
        tableName: "otp_tokens",
        timestamps: false
      }
    );
  
    return OtpToken;
  };
  