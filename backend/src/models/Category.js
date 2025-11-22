module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define(
      "Category",
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING,
          unique: true,
        },
        parent_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
      },
      {
        tableName: "categories",
        timestamps: false,
      }
    );
  
    return Category;
  };
  