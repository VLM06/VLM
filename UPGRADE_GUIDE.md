# VLM ERP v1.0 → v2.0 UPGRADE GUIDE

## 📋 WHAT YOU NEED TO KNOW

Your app has been **completely upgraded** from a basic Express app to a professional ERP system with:
- Security enhancements
- AI integration (Gemini)
- Better error handling
- Financial reports
- Data validation

## ✅ CHANGES SUMMARY

### SECURITY
```javascript
// ❌ OLD: No security
app.use(express.json());

// ✅ NEW: Full security
app.use(helmet());                          // Security headers
app.use(cors({ origin: ... }));             // CORS protection
app.use(express.json({ limit: '10mb' }));   // Size limit
// Plus input validation on all endpoints
```

### ERROR HANDLING
```javascript
// ❌ OLD: Crashes on error
db.run(sql, (err) => { res.json(result); });

// ✅ NEW: Proper error handling
db.run(sql, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ status: 'success', data: result });
});
```

### GEMINI AI (NEW!)
```javascript
// ✅ NEW: AI-powered insights
POST /api/ai/insights
{
  "query": "What are my expenses?"
}
// Returns AI analysis of your business
```

### DATABASE ENHANCEMENTS
```javascript
// ❌ OLD: Minimal fields
invoices (id, invoice_number, customer_name, amount, ...)

// ✅ NEW: Rich fields
invoices (
    id, invoice_number, customer_name,
    customer_email, customer_phone,        // NEW
    invoice_date, due_date,                // IMPROVED
    taxable_value, gst_amount, total_amount,
    amount_paid, machine_hours,
    payment_terms, description,            // NEW
    status,
    created_at, updated_at                 // NEW (timestamps)
)
```

### API RESPONSES
```javascript
// ❌ OLD: Inconsistent responses
res.json({ id: 123 });
res.status(500).json({ error: 'message' });

// ✅ NEW: Consistent format
res.status(201).json({
    status: 'success',
    message: 'Invoice created',
    id: 123,
    timestamp: '2024-07-04T...',
});

res.status(400).json({
    status: 'error',
    error: 'message',
    timestamp: '2024-07-04T...'
});
```

## 🔄 MIGRATION PATH

### Step 1: Backup Your Data
```bash
cp vlm_database.db vlm_database.db.backup
```

### Step 2: Install New Dependencies
```bash
npm install
```

### Step 3: Update Environment
```bash
cp .env.example .env
# Edit .env and add GEMINI_API_KEY (optional)
```

### Step 4: Run New Version
```bash
npm start
```

✅ **Done!** Your old data is preserved and new features available.

## 📝 API ENDPOINT CHANGES

### Invoice Endpoints

**Create Invoice - NEW FIELDS:**
```bash
# ❌ OLD
POST /api/invoices
{
  "invoice_number": "INV-001",
  "customer_name": "John",
  "invoice_date": "2024-07-04",
  "taxable_value": 1000,
  "apply_gst": true,
  "machine_hours": 5
}

# ✅ NEW (backward compatible + new fields)
POST /api/invoices
{
  "invoice_number": "INV-001",
  "customer_name": "John",
  "customer_email": "john@example.com",        // NEW
  "customer_phone": "9876543210",              // NEW
  "invoice_date": "2024-07-04",
  "due_date": "2024-08-04",                   // NEW
  "taxable_value": 1000,
  "apply_gst": true,
  "machine_hours": 5,
  "payment_terms": "NET 30",                  // NEW
  "description": "Services provided"           // NEW
}
```

**Response Format - IMPROVED:**
```bash
# ❌ OLD
{ "id": 123 }

# ✅ NEW
{
  "status": "success",
  "message": "Invoice created successfully",
  "id": 123
}
```

### New Endpoints

**Get Single Invoice - NEW:**
```bash
GET /api/invoices/123
```

**Financial Report - NEW:**
```bash
GET /api/reports/summary?start=2024-01-01&end=2024-12-31
```

**AI Insights - NEW:**
```bash
POST /api/ai/insights
{ "query": "What are my top expenses?" }
```

**AI Query Logs - NEW:**
```bash
GET /api/ai/logs
```

## 🔐 SECURITY IMPROVEMENTS

### 1. Input Validation
```javascript
// ✅ All inputs validated
body('invoice_number').notEmpty().trim(),
body('taxable_value').isFloat({ min: 0 }),
body('amount').isFloat({ min: 0 })
```

### 2. SQL Injection Prevention
```javascript
// ✅ Parameterized queries (always used)
db.run('INSERT INTO invoices (...) VALUES (?, ?, ?)', [value1, value2, value3]);
// ❌ String concatenation NEVER used
```

### 3. CORS Protection
```javascript
// ✅ NEW: Configurable CORS
app.use(cors({ origin: process.env.CORS_ORIGIN }));
```

### 4. Security Headers
```javascript
// ✅ NEW: Helmet for security headers
app.use(helmet());
```

## 📊 DATABASE MIGRATION

The app **automatically** adds new columns. If you get errors:

```bash
# Option 1: Let app handle it (safest)
npm start
# App migrates automatically

# Option 2: Manual migration
# Just delete the old database - it's auto-created
rm vlm_database.db
npm start
```

## 🧠 GEMINI AI SETUP

### Get API Key
1. Go to: https://ai.google.dev/
2. Click "Get API Key"
3. Create new key
4. Copy the key

### Add to .env
```env
GEMINI_API_KEY=your_key_here
```

### Use in App
```bash
curl -X POST http://localhost:3000/api/ai/insights \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my expenses?"}'

Response:
{
  "success": true,
  "insights": "Your total expenses are..."
}
```

**Note:** AI features are OPTIONAL. App works fine without them.

## 🐛 TROUBLESHOOTING

### Problem: "Module not found"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

### Problem: "Port 3000 already in use"
```bash
# Solution: Use different port
PORT=3001 npm start
```

### Problem: "Database locked"
```bash
# Solution: Kill processes and restart
# Windows:
taskkill /F /IM node.exe
rm vlm_database.db
npm start

# Mac/Linux:
killall node
rm vlm_database.db
npm start
```

### Problem: "Gemini API not working"
```
✅ This is OK! App works without it.
Just check:
- GEMINI_API_KEY is set in .env
- No typos in the key
- Key has proper permissions
```

## ✨ NEW FEATURES TO TRY

### 1. Due Date Management
```bash
# Create invoice with due date
POST /api/invoices
{ ..., "due_date": "2024-08-04" }

# Check dashboard for overdue alerts
GET /api/dashboard
```

### 2. Contact Information
```bash
# Add customer email/phone
POST /api/invoices
{
  ...,
  "customer_email": "john@example.com",
  "customer_phone": "9876543210"
}
```

### 3. AI Insights
```bash
# Ask AI questions
POST /api/ai/insights
{ "query": "Which customers owe me money?" }
```

### 4. Financial Reports
```bash
# Get summary reports
GET /api/reports/summary?start=2024-01-01&end=2024-12-31
```

## 📞 SUPPORT

If something breaks:
1. Check `start-dev.bat` for detailed logs
2. Check `.env` configuration
3. Ensure Node.js 18+ is installed
4. Delete database and restart if all else fails

---

**Upgrade Status:** ✅ Complete  
**Version:** 2.0.0  
**Date:** 2024-07-04
