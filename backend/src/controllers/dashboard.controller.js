const { Op, fn, col, literal } = require("sequelize");
const {
  Product,
  StockQuant,
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  ActivityLog,
  Warehouse,
  User,
} = require("../models");

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

function timeAgoFrom(date) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

async function enrichActivityRow(row) {
  // row: raw ActivityLog entry (may contain meta JSON)
  let product = null;
  let userName = null;
  let qty = null;
  let status = row.action || null;

  // try to get user name
  try {
    if (row.user_id) {
      const u = await User.findByPk(row.user_id, { attributes: ["id", "name"], raw: true });
      if (u) userName = u.name || null;
    }
  } catch (e) {}

  // try to parse meta for product, qty, status
  try {
    if (row.meta) {
      const meta = typeof row.meta === "string" ? JSON.parse(row.meta) : row.meta;
      if (meta) {
        if (meta.product_id) {
          const p = await Product.findByPk(meta.product_id, { attributes: ["id", "name", "sku"], raw: true });
          if (p) product = p.name || null;
        }
        if (meta.product_name) product = meta.product_name;
        if (meta.qty != null) qty = Number(meta.qty);
        if (meta.status) status = meta.status;
      }
    }
  } catch (e) {}

  // fallback: try reading target_type/target_id (for receipts/delivery lines you might have target_id)
  if (!product && row.target_type && row.target_id) {
    try {
      if (row.target_type.toLowerCase().includes("receipt")) {
        // can't reliably get product name from receipt row without join; skip
      }
    } catch (e) {}
  }

  return {
    id: row.id,
    product: product,
    qty: qty,
    user: userName,
    timeAgo: timeAgoFrom(row.created_at),
    status: status,
    raw: row,
  };
}

exports.getDashboard = async (req, res) => {
  try {
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : null;
    const categoryId = req.query.category_id ? Number(req.query.category_id) : null;
    const thresholdOverride = req.query.threshold ? Number(req.query.threshold) : null;
    const topN = req.query.top ? Math.max(1, Number(req.query.top)) : 10;

    // total products (active only)
    const productWhere = { is_active: 1 };
    if (categoryId) productWhere.category_id = categoryId;
    const totalProducts = await Product.count({ where: productWhere });

    // total stock quantity (aggregate from stock_quant)
    const stockWhere = {};
    if (warehouseId) stockWhere.warehouse_id = warehouseId;

    const totalStockRow = await StockQuant.findOne({
      attributes: [[fn("COALESCE", fn("SUM", col("quantity")), 0), "total_qty"]],
      where: stockWhere,
      raw: true,
    });
    const inStock = Math.round(Number(totalStockRow?.total_qty || 0) * 1000) / 1000;

    // aggregated stock per product
    const stockAgg = await StockQuant.findAll({
      attributes: ["product_id", [fn("COALESCE", fn("SUM", col("quantity")), 0), "prod_qty"]],
      where: stockWhere,
      group: ["product_id"],
      raw: true,
    });
    const qtyMap = {};
    stockAgg.forEach((r) => { qtyMap[r.product_id] = Number(r.prod_qty || 0); });

    // low stock: two modes
    let lowStockCount = 0;
    if (thresholdOverride != null) {
      const lowCount = Object.values(qtyMap).filter((q) => q <= thresholdOverride).length;
      lowStockCount = lowCount;
    } else {
      // get products list (either those with qty or all active products)
      const productIds = Object.keys(qtyMap).map((v) => Number(v));
      let products;
      if (productIds.length > 0) {
        const pWhere = { ...productWhere, id: { [Op.in]: productIds } };
        products = await Product.findAll({ where: pWhere, attributes: ["id", "reorder_level"], raw: true });
      } else {
        products = await Product.findAll({ where: productWhere, attributes: ["id", "reorder_level"], raw: true });
      }

      lowStockCount = products.reduce((acc, p) => {
        const qty = qtyMap[p.id] || 0;
        const reorder = Number(p.reorder_level || 0);
        return acc + (qty <= reorder ? 1 : 0);
      }, 0);
    }

    // out of stock: products with total qty == 0 (and active)
    const productIdsAll = await Product.findAll({ where: productWhere, attributes: ["id"], raw: true });
    const activeIds = productIdsAll.map((p) => p.id);
    const outOfStockCount = activeIds.filter((id) => (qtyMap[id] || 0) <= 0).length;

    // pending documents
    const pendingStatuses = { [Op.in]: ["draft", "waiting"] };
    const receiptWhere = { status: pendingStatuses };
    const doWhere = { status: pendingStatuses };
    const transferWhere = { status: pendingStatuses };
    if (warehouseId) {
      receiptWhere.warehouse_id = warehouseId;
      doWhere.warehouse_id = warehouseId;
      transferWhere[Op.or] = [{ from_warehouse_id: warehouseId }, { to_warehouse_id: warehouseId }];
    }
    const [pendingReceipts, pendingDO, pendingTransfers] = await Promise.all([
      Receipt.count({ where: receiptWhere }),
      DeliveryOrder.count({ where: doWhere }),
      InternalTransfer.count({ where: transferWhere }),
    ]);

    // recent activity (enriched)
    const rawActivities = await ActivityLog.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      raw: true,
    });
    const recentActivity = [];
    for (const r of rawActivities) {
      recentActivity.push(await enrichActivityRow(r));
    }

    // stockStatus object matching UI
    const stockStatus = {
      inStock,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    };

    // top products by stock
    const topProductsRows = await StockQuant.findAll({
      attributes: [
        "product_id",
        [fn("COALESCE", fn("SUM", col("quantity")), 0), "total_qty"],
      ],
      where: stockWhere,
      group: ["product_id"],
      order: [[literal("total_qty"), "DESC"]],
      limit: topN,
      raw: true,
    });

    const topProductIds = topProductsRows.map((r) => r.product_id);
    let topProducts = [];
    if (topProductIds.length > 0) {
      const prods = await Product.findAll({
        where: { id: { [Op.in]: topProductIds } },
        attributes: ["id", "name", "sku"],
        raw: true,
      });
      topProducts = topProductsRows.map((r) => {
        const p = prods.find((x) => x.id === r.product_id) || {};
        return {
          product_id: r.product_id,
          name: p.name || null,
          sku: p.sku || null,
          qty: Math.round(Number(r.total_qty || 0) * 1000) / 1000,
        };
      });
    }

    return res.json({
      success: true,
      data: {
        totalProducts,
        lowStock: lowStockCount,
        pendingReceipts,
        pendingDeliveries: pendingDO,
        pendingTransfers,
        stockStatus,
        recentActivities: recentActivity,
        topProducts,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
