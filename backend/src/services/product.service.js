const { Product, Category, StockQuant, Sequelize } = require("../models");
const { Op } = Sequelize;

exports.listProducts = async ({ search, category_id, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } }
    ];
  }

  if (category_id) where.category_id = category_id;

  const offset = (page - 1) * limit;

  const products = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: "category", attributes: ["id", "name"] }
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    raw: true,
    nest: true,
  });

  // merge stock quantities
  const productIds = products.rows.map(p => p.id);
  let stockMap = {};

  if (productIds.length > 0) {
    const stockRows = await StockQuant.findAll({
      where: { product_id: { [Op.in]: productIds } },
      attributes: ["product_id", [Sequelize.fn("SUM", Sequelize.col("quantity")), "qty"]],
      group: ["product_id"],
      raw: true,
    });

    stockRows.forEach(r => stockMap[r.product_id] = Number(r.qty));
  }

  const items = products.rows.map(p => ({
    ...p,
    stock: stockMap[p.id] || 0
  }));

  return {
    total: products.count,
    items,
    page,
    limit
  };
};

exports.getProduct = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      { model: Category, as: "category", attributes: ["id", "name"] }
    ],
    raw: true,
    nest: true,
  });

  if (!product) return null;

  const stock = await StockQuant.sum("quantity", { where: { product_id: id } });

  return {
    ...product,
    stock: Number(stock || 0)
  };
};

exports.createProduct = async (data) => {
  return Product.create(data);
};

exports.updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  await product.update(data);
  return product;
};

exports.deleteProduct = async (id) => {
  return Product.destroy({ where: { id } });
};
