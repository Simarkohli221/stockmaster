module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: DataTypes.STRING,
      role: DataTypes.STRING,
      phone: DataTypes.STRING,
      is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  return User;
};
