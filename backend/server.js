const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimitMiddleware = require('./middleware/rateLimit');
const { validateRegistration, validateLogin } = require('./middleware/validation');

const app = express();

// ============ SECURITY MIDDLEWARE ============
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(rateLimitMiddleware(900000, 100));

// ============ DATABASE CONNECTION ============
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vlm-erp';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
db.once('open', () => console.log('✅ Connected to MongoDB'));

// ============ SCHEMAS ============
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['admin', 'manager', 'user'] },
  phone: String,
  company: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const inventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  sku: { type: String, unique: true, sparse: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  category: String,
  description: String,
  reorderLevel: { type: Number, default: 10 },
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const salesSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customerName: { type: String, required: true },
  customerEmail: String,
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    quantity: { type: Number, min: 1 },
    unitPrice: Number,
    total: Number
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'shipped', 'delivered', 'cancelled'] },
  paymentMethod: String,
  shippingAddress: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const Sales = mongoose.model('Sales', salesSchema);

// ============ MIDDLEWARE ============
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vlm-secret-key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============ AUTH ROUTES ============
app.post('/api/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      company,
      role: 'user'
    });
    
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vlm-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vlm-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ DASHBOARD ROUTES ============
app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Inventory.countDocuments();
    const totalSales = await Sales.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalOrders = await Sales.countDocuments();
    const lowStockProducts = await Inventory.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }).limit(5);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalSalesAmount: totalSales[0]?.total || 0,
        totalOrders,
        lowStockProducts,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ INVENTORY ROUTES ============
app.post('/api/inventory', verifyToken, async (req, res) => {
  try {
    const { productName, sku, quantity, unitPrice, category, description, reorderLevel } = req.body;
    
    if (!productName || quantity === undefined || !unitPrice) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const inventory = new Inventory({
      productName,
      sku,
      quantity,
      unitPrice,
      category,
      description,
      reorderLevel: reorderLevel || 10,
      createdBy: req.userId
    });
    
    await inventory.save();
    res.status(201).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/inventory', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const inventory = await Inventory.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Inventory.countDocuments();
    
    res.json({
      success: true,
      data: inventory,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!inventory) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ SALES ROUTES ============
app.post('/api/sales', verifyToken, async (req, res) => {
  try {
    const { customerName, customerEmail, items, totalAmount, paymentMethod, shippingAddress } = req.body;
    
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const orderNumber = 'ORD-' + Date.now();
    
    const sales = new Sales({
      orderNumber,
      customerName,
      customerEmail,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress,
      status: 'pending',
      createdBy: req.userId
    });
    
    await sales.save();
    res.status(201).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const sales = await Sales.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Sales.countDocuments();
    
    res.json({
      success: true,
      data: sales,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/:id', verifyToken, async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id);
    if (!sales) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/sales/:id', verifyToken, async (req, res) => {
  try {
    const sales = await Sales.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!sales) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ REPORTS ROUTES ============
app.get('/api/reports', verifyToken, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    const salesByStatus = await Sales.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
    ]);
    
    const topProducts = await Sales.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', quantity: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);
    
    const monthlySales = await Sales.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        salesByStatus,
        topProducts,
        monthlySales,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ USER ROUTES ============
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, company, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ CHANGE PASSWORD ROUTE ============
app.post('/api/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ success: false, error: 'Password must contain at least 1 uppercase letter' });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, error: 'Password must contain at least 1 number' });
    }

    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: { email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ERROR HANDLING ============
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use(errorHandler);

// ============ SERVER START ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VLM ERP Backend running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`📊 API ready at /api`);
});

module.exports = app;
