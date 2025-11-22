const { Category } = require("../models");

exports.list = async () => {
  return Category.findAll({ order: [["name", "ASC"]] });
};

exports.create = async (data) => {
  return Category.create(data);
};

exports.update = async (id, data) => {
  const cat = await Category.findByPk(id);
  if (!cat) return null;
  await cat.update(data);
  return cat;
};

exports.delete = async (id) => Category.destroy({ where: { id } });
