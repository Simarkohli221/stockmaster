const service = require("../services/category.service");

exports.list = async (req, res) => {
  const cats = await service.list();
  res.json({ success: true, data: cats });
};

exports.create = async (req, res) => {
  const cat = await service.create(req.body);
  res.json({ success: true, data: cat });
};

exports.update = async (req, res) => {
  const cat = await service.update(req.params.id, req.body);
  if (!cat) return res.status(404).json({ success: false });
  res.json({ success: true, data: cat });
};

exports.delete = async (req, res) => {
  await service.delete(req.params.id);
  res.json({ success: true });
};
