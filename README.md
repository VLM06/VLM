# 🚀 VLM ERP SYSTEM v2.0

## Complete Invoice, Expense & Bank Ledger Management with AI

### ✨ Key Features

✅ **Invoice Management**
- Create, update, delete invoices
- Track customer payments
- Due date management
- Overdue alerts
- Payment terms tracking

✅ **Expense Tracking**
- Record vendor expenses
- GST calculation and tracking
- Payment status management
- Categorized expenses
- Vendor contact info

✅ **Bank Reconciliation**
- Complete bank ledger
- Transaction matching
- Bulk CSV import
- Cash flow tracking

✅ **AI-Powered Insights** (NEW!)
- Gemini AI financial analysis
- Smart recommendations
- Query-based insights
- Automatic logging

✅ **Financial Reports** (NEW!)
- Summary reports by date range
- Cash flow analysis
- Invoice/Expense trends

✅ **Security**
- Input validation
- SQL injection prevention
- CORS protection
- Security headers
- Environment-based config

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- npm (comes with Node.js)

### Step 1: Clone/Download the code
```bash
cd VLM
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Setup environment
```bash
cp .env.example .env
```

### Step 4: Add your Gemini API key (Optional but recommended)
1. Get API key from: https://ai.google.dev/
2. Edit `.env` and add: `GEMINI_API_KEY=your_key_here`

### Step 5: Start the server

**Production:**
```bash
npm start
```

**Development (with auto-reload):**
```bash
npm run dev
```

**Or use batch files (Windows):**
```bash
start.bat          # Production
start-dev.bat      # Development
```

---

## 🌐 API Endpoints

### Dashboard
```
GET /api/dashboard
→ Returns: metrics, alerts, summary
```

### Invoices
```
GET    /api/invoices           → List all invoices
GET    /api/invoices/:id       → Get single invoice
POST   /api/invoices           → Create invoice
PATCH  /api/invoices/:id/pay   → Record payment
DELETE /api/invoices/:id       → Void invoice
```

### Expenses
```
GET    /api/expenses           → List all expenses
POST   /api/expenses           → Create expense
PUT    /api/expenses/:id       → Update expense
PATCH  /api/expenses/:id/pay   → Record payment
DELETE /api/expenses/:id       → Delete expense
```

### Bank Ledger
```
GET    /api/bank               → List transactions
POST   /api/bank               → Add transaction
GET    /api/bank/match?amount=100&type=IN  → Find matching invoices
POST   /api/bank/bulk          → Bulk import transactions
```

### AI Insights (NEW!)
```
POST   /api/ai/insights        → Get AI analysis
GET    /api/ai/logs            → View query history
```

### Reports (NEW!)
```
GET    /api/reports/summary    → Financial summary
```

---

## 📝 Example Requests

### Create an Invoice
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
    "payment_terms": "NET 30",
    "description": "Services rendered"
  }'
```

### Record Invoice Payment
```bash
curl -X PATCH http://localhost:3000/api/invoices/1/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

### Get AI Insights
```bash
curl -X POST http://localhost:3000/api/ai/insights \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my top expenses this month?"}'
```

### Get Financial Summary
```bash
curl -X GET 'http://localhost:3000/api/reports/summary?start=2024-01-01&end=2024-12-31'
```

---

## 📊 Database Schema

### Tables
- **invoices** - Customer invoices with payment tracking
- **expenses** - Vendor expenses with GST
- **bank_ledger** - All transactions (IN/OUT)
- **ai_logs** - Gemini AI query history

### Features
- Automatic timestamps (created_at, updated_at)
- Status tracking (ACTIVE/VOID)
- Payment progress tracking
- GST and tax management

---

## 🔧 Configuration

Edit `.env` file:
```env
GEMINI_API_KEY=your_api_key          # For AI features
PORT=3000                            # Server port
NODE_ENV=development                 # Environment
DB_PATH=./vlm_database.db           # Database location
CORS_ORIGIN=http://localhost:3000   # CORS settings
```

---

## 🚀 What's New in v2.0

### Added
- ✅ Gemini AI integration
- ✅ Financial reports API
- ✅ Better input validation
- ✅ Security improvements
- ✅ Contact management (email, phone)
- ✅ Due date tracking
- ✅ Payment terms management
- ✅ AI query logging
- ✅ Better error handling
- ✅ Timestamps on all records

### Improved
- ✅ API response consistency
- ✅ Database schema
- ✅ Error messages
- ✅ Code organization
- ✅ Security headers
- ✅ Data validation

### Fixed
- ✅ Payment amount validation
- ✅ Floating-point precision
- ✅ Migration conflicts
- ✅ Error handling

---

## 📚 Documentation

See `CHANGELOG.md` for detailed upgrade information.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
PORT=3001 npm start
```

### Database Locked
```bash
# Delete old database
rm vlm_database.db
npm start
```

### AI Features Not Working
- Check GEMINI_API_KEY in .env
- App will work without it (graceful fallback)

### CORS Errors
- Update CORS_ORIGIN in .env
- Or set to '*' for development

---

## 📞 Support

For issues, check:
1. Database connectivity
2. API key configuration
3. Port availability
4. Node.js version (18+)

---

## 📄 License

This project is maintained by VLM06

---

**Version:** 2.0.0  
**Last Updated:** 2024-07-04  
**Status:** ✅ Production Ready
