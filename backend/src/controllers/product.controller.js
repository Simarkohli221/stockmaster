const productService = require("../services/product.service");

exports.list = async (req, res) => {
  try {
    const result = await productService.listProducts(req.query);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("Product list error:", err);
    return res.status(500).json({ success: false });
  }
};

exports.get = async (req, res) => {
  try {
    const product = await productService.getProduct(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

exports.create = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.json({ success: true, data: product });
  } catch (err) {
    console.error("Product create error:", err);
    return res.status(500).json({ success: false });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ success: false });
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

exports.delete = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
