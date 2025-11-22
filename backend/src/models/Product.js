module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define(
      "Product",
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
        sku: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        category_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        unit: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: DataTypes.TEXT,
        reorder_level: {
          type: DataTypes.DECIMAL(18, 4),
          defaultValue: 0,
        },
        default_warehouse_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.TINYINT,
          defaultValue: 1,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
      },
      {
        tableName: "products",
        timestamps: false,
      }
    );
  
    return Product;
  };
  