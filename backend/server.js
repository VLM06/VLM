const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ============ DATABASE CONNECTION ============
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vlm-erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('✅ Connected to MongoDB'));

// ============ SCHEMAS ============
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['admin', 'manager', 'user'] },
  phone: String,
  company: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const inventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  sku: { type: String, unique: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  category: String,
  description: String,
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
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'shipped', 'delivered'] },
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
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vlm-secret-key');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      company,
      role: 'user'
    });
    
    await user.save();
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vlm-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    
    res.json({
      totalUsers,
      totalProducts,
      totalSalesAmount: totalSales[0]?.total || 0,
      totalOrders,
      recentStats: {
        thisMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ INVENTORY ROUTES ============
app.post('/api/inventory', verifyToken, async (req, res) => {
  try {
    const { productName, sku, quantity, unitPrice, category, description } = req.body;
    
    const inventory = new Inventory({
      productName,
      sku,
      quantity,
      unitPrice,
      category,
      description,
      createdBy: req.userId
    });
    
    await inventory.save();
    res.status(201).json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory', verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ error: 'Product not found' });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SALES ROUTES ============
app.post('/api/sales', verifyToken, async (req, res) => {
  try {
    const { customerName, customerEmail, items, totalAmount } = req.body;
    const orderNumber = 'ORD-' + Date.now();
    
    const sales = new Sales({
      orderNumber,
      customerName,
      customerEmail,
      items,
      totalAmount,
      createdBy: req.userId
    });
    
    await sales.save();
    res.status(201).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales', verifyToken, async (req, res) => {
  try {
    const sales = await Sales.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales/:id', verifyToken, async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id);
    if (!sales) return res.status(404).json({ error: 'Order not found' });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sales/:id', verifyToken, async (req, res) => {
  try {
    const sales = await Sales.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ REPORTS ROUTES ============
app.get('/api/reports', verifyToken, async (req, res) => {
  try {
    const salesByStatus = await Sales.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
    ]);
    
    const topProducts = await Sales.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', quantity: { $sum: '$items.quantity' } } },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      salesByStatus,
      topProducts,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ USER ROUTES ============
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SERVER START ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VLM ERP Backend running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
