# 🚀 VLM ERP SYSTEM v2.0
## Invoice, Expense & Bank Ledger Management with Gemini AI

---

## ⚡ QUICK START

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Setup Environment (Optional for AI)
```bash
cp .env.example .env
# Edit .env and add GEMINI_API_KEY if you want AI features
```

### 3️⃣ Run the App
```bash
npm start        # Production
npm run dev      # Development (auto-reload)
```

**Server runs at:** http://localhost:3000

---

## ✨ NEW FEATURES IN v2.0

✅ **Gemini AI Integration** - Ask AI questions about your business
✅ **Enhanced Security** - Input validation, CORS, security headers
✅ **Better Database** - Customer email/phone, due dates, timestamps
✅ **Financial Reports** - Get summaries by date range
✅ **Improved Error Handling** - Better error messages
✅ **API Improvements** - Consistent response format
✅ **Contact Management** - Store customer & vendor info
✅ **Payment Terms** - Track NET 30, NET 60, etc.

---

## 📚 API ENDPOINTS

### 📊 Dashboard
```
GET /api/dashboard
→ Returns: metrics, alerts, summary
```

### 💰 Invoices
```
GET    /api/invoices           # List all invoices
GET    /api/invoices/:id       # Get single invoice
POST   /api/invoices           # Create invoice
PATCH  /api/invoices/:id/pay   # Record payment
DELETE /api/invoices/:id       # Void invoice
```

### 💸 Expenses
```
GET    /api/expenses           # List all expenses
POST   /api/expenses           # Create expense
PUT    /api/expenses/:id       # Update expense
PATCH  /api/expenses/:id/pay   # Record payment
DELETE /api/expenses/:id       # Delete expense
```

### 🏦 Bank Ledger
```
GET    /api/bank               # List transactions
POST   /api/bank               # Add transaction
GET    /api/bank/match         # Find matching invoices/expenses
POST   /api/bank/bulk          # Bulk import
```

### 🤖 AI Insights (NEW!)
```
POST   /api/ai/insights        # Ask AI questions
GET    /api/ai/logs            # View AI query history
```

### 📈 Reports (NEW!)
```
GET    /api/reports/summary    # Financial summary
```

---

## 📝 EXAMPLE REQUESTS

### Create Invoice
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "9876543210",
    "invoice_date": "2024-07-04",
    "due_date": "2024-08-04",
    "taxable_value": 1000,
    "apply_gst": true,
    "machine_hours": 10,
    "payment_terms": "NET 30"
  }'
```

### Get AI Insights
```bash
curl -X POST http://localhost:3000/api/ai/insights \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my top expenses?"}'
```

### Get Financial Summary
```bash
curl -X GET 'http://localhost:3000/api/reports/summary?start=2024-01-01&end=2024-12-31'
```

---

## ⚙️ CONFIGURATION

Edit `.env` file:
```env
GEMINI_API_KEY=your_api_key    # For AI (optional)
PORT=3000                       # Server port
NODE_ENV=development            # Environment
DB_PATH=./vlm_database.db      # Database location
CORS_ORIGIN=*                   # CORS settings
```

---

## 🆚 WHAT CHANGED FROM v1.0

### Security
- ✅ Added Helmet.js (security headers)
- ✅ Added CORS protection
- ✅ Added input validation
- ✅ Parameterized queries (SQL injection prevention)

### Features
- ✅ Gemini AI integration
- ✅ Financial reports
- ✅ Customer email/phone fields
- ✅ Due date management
- ✅ Payment terms tracking
- ✅ Timestamps on all records
- ✅ AI query logging

### API
- ✅ Consistent response format
- ✅ Better error messages
- ✅ GET single invoice endpoint
- ✅ Reports endpoint
- ✅ AI endpoints

### Code
- ✅ Better error handling
- ✅ Input validation middleware
- ✅ Proper HTTP status codes
- ✅ Async error handling
- ✅ Code organization

---

## 🔧 TROUBLESHOOTING

### Port already in use?
```bash
PORT=3001 npm start
```

### Database locked?
```bash
rm vlm_database.db
npm start
```

### Dependencies issue?
```bash
rm -rf node_modules
npm install
```

### Gemini not working?
- It's optional! App works fine without it
- Check your API key in .env
- Get one free at https://ai.google.dev/

---

## 📄 DATABASE SCHEMA

### Tables
- **invoices** - Customer invoices
- **expenses** - Vendor expenses
- **bank_ledger** - Bank transactions
- **ai_logs** - AI query history

### Key Fields
- Status tracking (ACTIVE/VOID)
- Payment progress
- GST and tax management
- Timestamps (created_at, updated_at)
- Contact information

---

## ✅ BACKWARD COMPATIBLE

✅ Old data preserved
✅ Old endpoints still work
✅ New features available immediately
✅ Auto-migration of schema

---

**Version:** 2.0.0
**Status:** ✅ Production Ready
**Last Updated:** 2024-07-04
