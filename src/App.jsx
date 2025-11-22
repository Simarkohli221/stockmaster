import { useState, useEffect } from 'react';
import './App.css';
import { 
  Package, Mail, Lock, ArrowRight, Boxes, TrendingUp, Shield, 
  Home, PackageOpen, Truck, ClipboardList, History, Settings, 
  User, LogOut, Search, Bell, Plus, Filter, ChevronDown, 
  AlertTriangle, CheckCircle, Clock, MapPin, Edit, Trash2,
  BarChart3, PieChart, Activity, DollarSign, ShoppingCart,
  Warehouse, ArrowUpRight, ArrowDownRight, RefreshCw, Eye,
  Save, X, FileText, Calendar, Loader, AlertCircle
} from 'lucide-react';

// ============================================
// API SERVICE LAYER - Backend Integration Ready
// ============================================
// TODO: Replace mock responses with actual fetch calls to your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiService = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (username, email, password, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return response.json();
  },

  sendPasswordResetOTP: async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 1000);
    });
  },

  resetPassword: async (email, otp, newPassword) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 1000);
    });
  },

  // Product endpoints
  getProducts: async (filters = {}) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (!token) throw new Error('No authentication token found');
    
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getProductById: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  createProduct: async (productData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  updateProduct: async (id, productData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  deleteProduct: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  // Dashboard endpoints
  getDashboardKPIs: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        success: true,
        data: {
          totalProducts: 1247,
          lowStockItems: 23,
          pendingReceipts: 15,
          pendingDeliveries: 8,
        }
      }), 800);
    });
  },

  getRecentActivities: async (limit = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        success: true,
        data: [
          { id: 1, type: 'receipt', product: 'Steel Rods', qty: 50, user: 'John Doe', time: '2 hours ago', status: 'completed' },
          { id: 2, type: 'delivery', product: 'Office Chairs', qty: 10, user: 'Sarah Chen', time: '3 hours ago', status: 'pending' },
          { id: 3, type: 'transfer', product: 'Laptops', qty: 5, user: 'Mike Johnson', time: '5 hours ago', status: 'completed' },
        ]
      }), 800);
    });
  },

  getWarehouses: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        success: true,
        data: [
          { id: 1, name: 'Warehouse A', code: 'WH-A' },
          { id: 2, name: 'Warehouse B', code: 'WH-B' },
          { id: 3, name: 'Warehouse C', code: 'WH-C' },
        ]
      }), 500);
    });
  },

  getCategories: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        success: true,
        data: [
          { id: 1, name: 'Raw Materials' },
          { id: 2, name: 'Furniture' },
          { id: 3, name: 'Electronics' },
          { id: 4, name: 'Office Supplies' },
        ]
      }), 500);
    });
  },
};

// ============================================
// REUSABLE COMPONENTS
// ============================================

function NavItem({ icon: Icon, label, active, onClick, sidebarOpen }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-purple-200 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {sidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );
}

function KPICard({ label, value, change, icon: Icon, color, loading }) {
  const colorClasses = {
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {!loading && change && (
          <span className={`text-sm font-semibold ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
        )}
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-20 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-32"></div>
        </div>
      ) : (
        <>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          <p className="text-purple-200 text-sm">{label}</p>
        </>
      )}
    </div>
  );
}

function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader className={`${sizeClasses[size]} animate-spin text-purple-400`} />;
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-200 text-sm">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-xs text-red-300 hover:text-red-100 underline">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD COMPONENT
// ============================================

function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpisRes, activitiesRes] = await Promise.all([
        apiService.getDashboardKPIs(),
        apiService.getRecentActivities()
      ]);
      setKpis(kpisRes.data);
      setActivities(activitiesRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const kpiData = kpis ? [
    { label: 'Total Products', value: kpis.totalProducts.toLocaleString(), change: '+12%', icon: Package, color: 'purple' },
    { label: 'Low Stock Items', value: kpis.lowStockItems.toString(), change: '-5%', icon: AlertTriangle, color: 'orange' },
    { label: 'Pending Receipts', value: kpis.pendingReceipts.toString(), change: '+3', icon: ShoppingCart, color: 'blue' },
    { label: 'Pending Deliveries', value: kpis.pendingDeliveries.toString(), change: '-2', icon: Truck, color: 'green' },
  ] : [];

  return (
    <div className="p-8 space-y-6">
      {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          [1,2,3,4].map(i => <KPICard key={i} loading={true} color="purple" icon={Package} />)
        ) : (
          kpiData.map((kpi, index) => <KPICard key={index} {...kpi} />)
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activities</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-white/5 rounded-xl p-4 h-20"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'receipt' ? 'bg-blue-500/20' :
                        activity.type === 'delivery' ? 'bg-green-500/20' :
                        activity.type === 'transfer' ? 'bg-purple-500/20' : 'bg-orange-500/20'
                      }`}>
                        {activity.type === 'receipt' && <PackageOpen className="w-5 h-5 text-blue-400" />}
                        {activity.type === 'delivery' && <Truck className="w-5 h-5 text-green-400" />}
                        {activity.type === 'transfer' && <RefreshCw className="w-5 h-5 text-purple-400" />}
                        {activity.type === 'adjustment' && <ClipboardList className="w-5 h-5 text-orange-400" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{activity.product}</p>
                        <p className="text-purple-300 text-sm">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{activity.qty} units</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Stock Status Overview</h3>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-200">In Stock</span>
                <span className="text-white font-bold">1,124</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '90%'}}></div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-200">Low Stock</span>
                <span className="text-white font-bold">23</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{width: '15%'}}></div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-200">Out of Stock</span>
                <span className="text-white font-bold">8</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full" style={{width: '5%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCTS COMPONENT - Backend Ready
// ============================================

function Products() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    unit: 'pcs',
    stock: 0,
    warehouse_id: '',
    reorder_level: 0,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, warehousesRes, categoriesRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getWarehouses(),
        apiService.getCategories()
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError('Failed to load products data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category_id: '',
      unit: 'pcs',
      stock: 0,
      warehouse_id: '',
      reorder_level: 0,
      description: ''
    });
    setEditingProduct(null);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.sku || !formData.category_id || !formData.warehouse_id) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        const result = await apiService.updateProduct(editingProduct.id, formData);
        setProducts(products.map(p => p.id === editingProduct.id ? result.data : p));
      } else {
        const result = await apiService.createProduct(formData);
        const category = categories.find(c => c.id === parseInt(formData.category_id));
        const warehouse = warehouses.find(w => w.id === parseInt(formData.warehouse_id));
        const newProduct = {
          ...result.data,
          category: category?.name,
          warehouse_name: warehouse?.name
        };
        setProducts([...products, newProduct]);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await apiService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id || '',
      unit: product.unit,
      stock: product.stock,
      warehouse_id: product.warehouse_id || '',
      reorder_level: product.reorder_level || 0,
      description: product.description || ''
    });
    setShowModal(true);
  };

  const getStockStatus = (stock, reorderLevel) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-500/20 text-red-400' };
    if (stock <= reorderLevel) return { label: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-400' };
    return { label: 'In Stock', color: 'bg-green-500/20 text-green-400' };
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {loading ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.map((product) => {
                  const status = getStockStatus(product.stock, product.reorder_level);
                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-purple-200">{product.sku}</td>
                      <td className="px-6 py-4 text-purple-200">{product.category}</td>
                      <td className="px-6 py-4 text-white">{product.stock} {product.unit}</td>
                      <td className="px-6 py-4 text-purple-200">{product.warehouse_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-purple-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-purple-200 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">Product Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter product name"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">SKU *</label>
                <input 
                  type="text" 
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. PR-001"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Category *</label>
                <select 
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  disabled={saving}
                >
                  <option value="" className="bg-slate-800">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Warehouse *</label>
                <select 
                  name="warehouse_id"
                  value={formData.warehouse_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  disabled={saving}
                >
                  <option value="" className="bg-slate-800">Select Warehouse</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id} className="bg-slate-800">{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Unit of Measure</label>
                <select 
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  disabled={saving}
                >
                  <option value="pcs" className="bg-slate-800">Pieces</option>
                  <option value="kg" className="bg-slate-800">Kilograms</option>
                  <option value="litre" className="bg-slate-800">Litres</option>
                  <option value="meter" className="bg-slate-800">Meters</option>
                </select>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Initial Stock</label>
                <input 
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="0"
                  min="0"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Reorder Level</label>
                <input 
                  type="number"
                  name="reorder_level"
                  value={formData.reorder_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="0"
                  min="0"
                  disabled={saving}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-purple-200 text-sm mb-2">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter product description"
                  rows="3"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => { setShowModal(false); resetForm(); }}
                disabled={saving}
                className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingProduct ? 'Update' : 'Save'} Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function StockMasterApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('warehouse_staff');
  const [resetEmail, setResetEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      const result = await apiService.login(email, password);
      if (result.success) {
        localStorage.setItem('token', result.token); // Store token
        setCurrentUser(result.user);
        setIsAuthenticated(true);
      } else {
        alert('Login failed');
      }
    } catch (err) {
      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const result = await apiService.register(name, email, password, 'user'); // Add default role
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
      } else {
        alert('Signup failed');
      }
    } catch (err) {
      alert('Signup failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    // TODO: Clear token
    // localStorage.removeItem('token');
  };

  const handleForgotPassword = async () => {
    if (!otpSent) {
      if (!resetEmail) {
        alert('Please enter your email');
        return;
      }
      setLoading(true);
      try {
        await apiService.sendPasswordResetOTP(resetEmail);
        setOtpSent(true);
        alert('OTP sent to your email!');
      } catch (err) {
        alert('Failed to send OTP');
      } finally {
        setLoading(false);
      }
    } else {
      if (!otp || !newPassword) {
        alert('Please enter OTP and new password');
        return;
      }
      setLoading(true);
      try {
        await apiService.resetPassword(resetEmail, otp, newPassword);
        alert('Password reset successful!');
        setShowForgotPassword(false);
        setOtpSent(false);
        setResetEmail('');
        setOtp('');
        setNewPassword('');
      } catch (err) {
        alert('Password reset failed');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        showForgotPassword={showForgotPassword}
        setShowForgotPassword={setShowForgotPassword}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        role={role}
        setRole={setRole}
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        otpSent={otpSent}
        setOtpSent={setOtpSent}
        otp={otp}
        setOtp={setOtp}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handleForgotPassword={handleForgotPassword}
        loading={loading}
      />
    );
  }

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.2); }
          66% { transform: translate(-30px, 40px) scale(0.85); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 flex h-screen">
          <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/10 backdrop-blur-2xl border-r border-white/20 transition-all duration-300 flex flex-col`}>
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                {sidebarOpen && <span className="text-white font-bold text-xl">StockMaster</span>}
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <NavItem icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} sidebarOpen={sidebarOpen} />
              <NavItem icon={Package} label="Products" active={currentPage === 'products'} onClick={() => setCurrentPage('products')} sidebarOpen={sidebarOpen} />
              <NavItem icon={PackageOpen} label="Receipts" active={currentPage === 'receipts'} onClick={() => setCurrentPage('receipts')} sidebarOpen={sidebarOpen} />
              <NavItem icon={Truck} label="Deliveries" active={currentPage === 'deliveries'} onClick={() => setCurrentPage('deliveries')} sidebarOpen={sidebarOpen} />
              <NavItem icon={RefreshCw} label="Transfers" active={currentPage === 'transfers'} onClick={() => setCurrentPage('transfers')} sidebarOpen={sidebarOpen} />
              <NavItem icon={ClipboardList} label="Adjustments" active={currentPage === 'adjustments'} onClick={() => setCurrentPage('adjustments')} sidebarOpen={sidebarOpen} />
              <NavItem icon={History} label="History" active={currentPage === 'history'} onClick={() => setCurrentPage('history')} sidebarOpen={sidebarOpen} />
              <NavItem icon={Settings} label="Settings" active={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} sidebarOpen={sidebarOpen} />
            </nav>

            <div className="p-4 border-t border-white/20">
              <NavItem icon={User} label="Profile" onClick={() => setCurrentPage('profile')} sidebarOpen={sidebarOpen} />
              <NavItem icon={LogOut} label="Logout" onClick={handleLogout} sidebarOpen={sidebarOpen} />
            </div>
          </aside>

          <main className="flex-1 overflow-auto">
            <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-20">
              <div className="px-8 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-purple-300 transition-colors">
                    <Filter className="w-6 h-6" />
                  </button>
                  <h1 className="text-2xl font-bold text-white">
                    {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                  </h1>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <button className="relative p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-xl px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-white font-medium hidden md:block">
                      {currentUser?.name || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <div className="min-h-[calc(100vh-80px)]">
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'products' && <Products />}
              {currentPage === 'receipts' && (
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                    <PackageOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Receipts Module</h3>
                    <p className="text-purple-200">Manage incoming stock from suppliers</p>
                    <p className="text-purple-300 text-sm mt-2">Coming Soon - Backend Integration Ready</p>
                  </div>
                </div>
              )}
              {currentPage === 'deliveries' && (
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                    <Truck className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Deliveries Module</h3>
                    <p className="text-purple-200">Track outgoing shipments to customers</p>
                    <p className="text-purple-300 text-sm mt-2">Coming Soon - Backend Integration Ready</p>
                  </div>
                </div>
              )}
              {currentPage === 'transfers' && (
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                    <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Internal Transfers</h3>
                    <p className="text-purple-200">Move stock between warehouses</p>
                    <p className="text-purple-300 text-sm mt-2">Coming Soon - Backend Integration Ready</p>
                  </div>
                </div>
              )}
              {currentPage === 'adjustments' && (
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                    <ClipboardList className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Stock Adjustments</h3>
                    <p className="text-purple-200">Correct inventory discrepancies</p>
                    <p className="text-purple-300 text-sm mt-2">Coming Soon - Backend Integration Ready</p>
                  </div>
                </div>
              )}
              {currentPage === 'history' && (
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                    <History className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Move History</h3>
                    <p className="text-purple-200">View all stock movements</p>
                    <p className="text-purple-300 text-sm mt-2">Coming Soon - Backend Integration Ready</p>
                  </div>
                </div>
              )}
              {currentPage === 'settings' && (
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                    <Settings className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Settings</h3>
                    <p className="text-purple-200">Configure warehouses and system preferences</p>
                    <p className="text-purple-300 text-sm mt-2">Coming Soon - Backend Integration Ready</p>
                  </div>
                </div>
              )}
              {currentPage === 'profile' && (
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                    <User className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Profile</h3>
                    <p className="text-purple-200">Manage your account settings</p>
                    <p className="text-purple-300 text-sm mt-2">Coming Soon - Backend Integration Ready</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function LoginPage({ 
  isLogin, setIsLogin, showForgotPassword, setShowForgotPassword,
  email, setEmail, password, setPassword, name, setName, 
  phone, setPhone, role, setRole, resetEmail, setResetEmail,
  otpSent, setOtpSent, otp, setOtp, newPassword, setNewPassword,
  handleLogin, handleSignup, handleForgotPassword, loading
}) {
  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.2); }
          66% { transform: translate(-30px, 40px) scale(0.85); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {showForgotPassword ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg shadow-purple-500/50 animate-pulse-slow">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white text-center mb-2">Reset Password</h2>
              <p className="text-purple-200 text-center mb-8">
                {otpSent ? 'Enter OTP and new password' : 'Enter your email to receive OTP'}
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="you@example.com"
                      disabled={otpSent || loading}
                    />
                  </div>
                </div>

                {otpSent && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">OTP Code</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter new password"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{otpSent ? 'Reset Password' : 'Send OTP'}</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setOtpSent(false);
                    setResetEmail('');
                    setOtp('');
                    setNewPassword('');
                  }}
                  disabled={loading}
                  className="w-full text-purple-200 hover:text-white transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between z-10">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-12">
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-4 rounded-2xl shadow-2xl shadow-purple-500/50">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">StockMaster</h1>
                  <p className="text-purple-300 text-lg">Inventory Management System</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-2xl backdrop-blur-sm border border-purple-400/30">
                    <Boxes className="w-7 h-7 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Real-Time Tracking</h3>
                    <p className="text-purple-300">Monitor inventory across multiple warehouses</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-pink-500/20 to-blue-500/20 p-4 rounded-2xl backdrop-blur-sm border border-pink-400/30">
                    <TrendingUp className="w-7 h-7 text-pink-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
                    <p className="text-purple-300">Get insights on stock levels and trends</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-2xl backdrop-blur-sm border border-blue-400/30">
                    <Shield className="w-7 h-7 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Secure & Reliable</h3>
                    <p className="text-purple-300">Enterprise-grade security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
            <div className="w-full max-w-md">
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg shadow-purple-500/50">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">StockMaster</h1>
              </div>

              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="flex justify-center mb-6">
                  <div className="bg-white/10 rounded-full p-1 backdrop-blur-sm shadow-xl border border-white/20">
                    <button
                      onClick={() => setIsLogin(true)}
                      disabled={loading}
                      className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                        isLogin ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/50 scale-105' : 'text-purple-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      disabled={loading}
                      className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                        !isLogin ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/50 scale-105' : 'text-purple-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-white text-center mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-purple-200 text-center mb-8">
                  {isLogin ? 'Enter your credentials to access your account' : 'Join us to manage your inventory'}
                </p>

                <div className="space-y-6">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                      >
                        <option value="warehouse_staff" className="bg-slate-800">Warehouse Staff</option>
                        <option value="manager" className="bg-slate-800">Manager</option>
                        <option value="admin" className="bg-slate-800">Admin</option>
                      </select>
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center text-purple-200 cursor-pointer hover:text-white transition">
                        <input type="checkbox" className="mr-2 rounded" />
                        Remember me
                      </label>
                      <button
                        onClick={() => setShowForgotPassword(true)}
                        className="text-purple-300 hover:text-white transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transform hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-2xl shadow-purple-500/50 flex items-center justify-center space-x-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-purple-200 text-center text-sm mt-6">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    disabled={loading}
                    className="text-white font-semibold hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}