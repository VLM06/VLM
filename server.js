// ==========================================
// VLM ERP SYSTEM v2.0 - UPGRADED
// Complete Rewrite with Gemini AI Integration
// Features: Invoice Management, Expense Tracking, Bank Reconciliation, AI Insights
// ==========================================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// DATABASE INITIALIZATION
// ==========================================
const db = new sqlite3.Database(process.env.DB_PATH || './vlm_database.db', (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to VLM Master Database v2.0');
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {
    // Create Tables with Enhanced Schema
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        invoice_date TEXT NOT NULL,
        due_date TEXT,
        taxable_value REAL NOT NULL DEFAULT 0,
        gst_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        amount_paid REAL NOT NULL DEFAULT 0,
        machine_hours REAL NOT NULL DEFAULT 0,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        payment_terms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_name TEXT NOT NULL,
        vendor_email TEXT,
        vendor_phone TEXT,
        expense_date TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        gst_paid REAL NOT NULL DEFAULT 0,
        amount_paid REAL NOT NULL DEFAULT 0,
        category TEXT NOT NULL,
        invoice_number TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bank_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        txn_date TEXT NOT NULL,
        description TEXT NOT NULL,
        txn_type TEXT NOT NULL CHECK(txn_type IN ('IN', 'OUT')),
        amount REAL NOT NULL,
        reference_type TEXT,
        reference_id INTEGER,
        reconciled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ai_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT,
        response TEXT,
        query_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Migration: Add missing columns if they don't exist
    const alterTableStatements = [
        `ALTER TABLE invoices ADD COLUMN customer_email TEXT`,
        `ALTER TABLE invoices ADD COLUMN customer_phone TEXT`,
        `ALTER TABLE invoices ADD COLUMN due_date TEXT`,
        `ALTER TABLE invoices ADD COLUMN payment_terms TEXT`,
        `ALTER TABLE expenses ADD COLUMN vendor_email TEXT`,
        `ALTER TABLE expenses ADD COLUMN vendor_phone TEXT`,
        `ALTER TABLE expenses ADD COLUMN payment_method TEXT`
    ];

    alterTableStatements.forEach(sql => {
        db.run(sql, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Migration error:', err.message);
            }
        });
    });

    // Auto-heal: Set default status for null values
    db.run(`UPDATE invoices SET status = 'ACTIVE' WHERE status IS NULL`);
    db.run(`UPDATE expenses SET status = 'ACTIVE' WHERE status IS NULL`);
    
    console.log('✅ Database schema initialized successfully');
});

// ==========================================
// ERROR HANDLER MIDDLEWARE
// ==========================================
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ==========================================
// GEMINI AI INTEGRATION
// ==========================================
const initializeGemini = async () => {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        return genAI.getGenerativeModel({ model: 'gemini-pro' });
    } catch (err) {
        console.warn('⚠️ Gemini API not available. AI features disabled.');
        return null;
    }
};

let geminiModel = null;
initializeGemini().then(model => {
    geminiModel = model;
    if (geminiModel) console.log('✅ Gemini AI Model initialized');
});

const getAIInsights = async (query, context) => {
    if (!geminiModel) return { success: false, message: 'AI not available' };
    try {
        const response = await geminiModel.generateContent(
            `You are a financial advisor for an ERP system. Based on this data: ${JSON.stringify(context)}. Answer concisely: ${query}`
        );
        const result = response.response.text();
        
        // Log AI interaction
        db.run(
            `INSERT INTO ai_logs (query, response, query_type) VALUES (?, ?, ?)`,
            [query, result, 'financial_insight']
        );
        
        return { success: true, insights: result };
    } catch (err) {
        console.error('AI Error:', err.message);
        return { success: false, message: err.message };
    }
};

// ==========================================
// DASHBOARD API
// ==========================================
app.get('/api/dashboard', asyncHandler(async (req, res) => {
    db.all("SELECT * FROM invoices WHERE status='ACTIVE'", [], (err, invoiceRows) => {
        db.get(
            "SELECT SUM(amount) as gross_exp, SUM(amount_paid) as exp_paid, SUM(gst_paid) as total_itc FROM expenses WHERE status='ACTIVE'",
            [],
            (err, expenseRow) => {
                db.get(
                    "SELECT SUM(CASE WHEN txn_type='IN' THEN amount ELSE 0 END) - SUM(CASE WHEN txn_type='OUT' THEN amount ELSE 0 END) as bank_balance FROM bank_ledger",
                    [],
                    (err, bankRow) => {
                        let pendingReceivables = 0, totalHours = 0;
                        let overdueAlerts = [];
                        const today = new Date();

                        invoiceRows = invoiceRows || [];
                        invoiceRows.forEach(inv => {
                            const balanceDue = inv.total_amount - inv.amount_paid;
                            if (balanceDue > 0) {
                                pendingReceivables += balanceDue;
                                const diffDays = Math.ceil(
                                    Math.abs(today - new Date(inv.invoice_date)) / (1000 * 60 * 60 * 24)
                                );
                                if (diffDays >= 30) {
                                    overdueAlerts.push({
                                        invoice_number: inv.invoice_number,
                                        customer_name: inv.customer_name,
                                        days_overdue: diffDays,
                                        balance_due: balanceDue
                                    });
                                }
                            }
                            totalHours += inv.machine_hours || 0;
                        });

                        const totalGrossExp = expenseRow.gross_exp || 0;
                        const totalUnpaidExp = totalGrossExp - (expenseRow.exp_paid || 0);
                        const bankBalance = bankRow.bank_balance || 0;

                        res.json({
                            status: 'success',
                            metrics: {
                                bankBalance,
                                pendingReceivables,
                                totalHours,
                                gstItc: expenseRow.total_itc || 0,
                                totalGrossExp,
                                totalUnpaidExp,
                                invoiceCount: invoiceRows.length,
                                overdueCount: overdueAlerts.length
                            },
                            overdueAlerts,
                            timestamp: new Date().toISOString()
                        });
                    }
                );
            }
        );
    });
}));

// ==========================================
// INVOICES API
// ==========================================
app.get('/api/invoices', (req, res) => {
    db.all(
        "SELECT * FROM invoices WHERE status != 'VOID' ORDER BY invoice_date DESC",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', data: rows || [] });
        }
    );
});

app.post(
    '/api/invoices',
    [
        body('invoice_number').notEmpty().trim(),
        body('customer_name').notEmpty().trim(),
        body('invoice_date').notEmpty(),
        body('taxable_value').isFloat({ min: 0 }),
        body('apply_gst').optional().isBoolean()
    ],
    handleValidationErrors,
    (req, res) => {
        const { invoice_number, customer_name, customer_email, customer_phone, invoice_date, due_date, taxable_value, machine_hours, apply_gst, payment_terms, description } = req.body;
        const taxable = parseFloat(taxable_value) || 0;
        const gst = apply_gst ? taxable * 0.18 : 0;

        db.run(
            `INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, invoice_date, due_date, taxable_value, gst_amount, total_amount, machine_hours, payment_terms, description, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoice_number, customer_name, customer_email || null, customer_phone || null,
                invoice_date, due_date || null, taxable, gst, taxable + gst,
                parseFloat(machine_hours) || 0, payment_terms || 'NET 30', description || '', 'ACTIVE'
            ],
            function(err) {
                if (err) {
                    return res.status(400).json({
                        status: 'error',
                        message: err.message.includes('UNIQUE') ? 'Invoice number already exists' : err.message
                    });
                }
                res.status(201).json({
                    status: 'success',
                    message: 'Invoice created successfully',
                    id: this.lastID
                });
            }
        );
    }
);

app.get('/api/invoices/:id', (req, res) => {
    db.get(
        "SELECT * FROM invoices WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Invoice not found' });
            res.json({ status: 'success', data: row });
        }
    );
});

app.patch('/api/invoices/:id/pay', (req, res) => {
    const amount = parseFloat(req.body.amount) || 0;
    if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    db.run(
        "UPDATE invoices SET amount_paid = MIN(amount_paid + ?, total_amount), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [amount, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', message: 'Payment recorded' });
        }
    );
});

app.delete('/api/invoices/:id', (req, res) => {
    db.run(
        "UPDATE invoices SET status='VOID', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', message: 'Invoice voided' });
        }
    );
});

// ==========================================
// EXPENSES API
// ==========================================
app.get('/api/expenses', (req, res) => {
    db.all(
        "SELECT * FROM expenses WHERE status='ACTIVE' ORDER BY expense_date DESC",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', data: rows || [] });
        }
    );
});

app.post(
    '/api/expenses',
    [
        body('vendor_name').notEmpty().trim(),
        body('expense_date').notEmpty(),
        body('amount').isFloat({ min: 0 }),
        body('category').notEmpty().trim()
    ],
    handleValidationErrors,
    (req, res) => {
        const { vendor_name, vendor_email, vendor_phone, expense_date, amount, gst_paid, category, invoice_number, payment_method, description } = req.body;

        db.run(
            `INSERT INTO expenses (vendor_name, vendor_email, vendor_phone, expense_date, amount, gst_paid, category, invoice_number, payment_method, description, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vendor_name, vendor_email || null, vendor_phone || null, expense_date,
                parseFloat(amount) || 0, parseFloat(gst_paid) || 0, category, invoice_number || null,
                payment_method || 'PENDING', description || '', 'ACTIVE'
            ],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({
                    status: 'success',
                    message: 'Expense recorded successfully',
                    id: this.lastID
                });
            }
        );
    }
);

app.put(
    '/api/expenses/:id',
    [
        body('vendor_name').notEmpty().trim(),
        body('expense_date').notEmpty(),
        body('amount').isFloat({ min: 0 }),
        body('category').notEmpty().trim()
    ],
    handleValidationErrors,
    (req, res) => {
        const { vendor_name, vendor_email, vendor_phone, expense_date, amount, gst_paid, category, invoice_number, payment_method, description } = req.body;

        db.run(
            `UPDATE expenses SET vendor_name=?, vendor_email=?, vendor_phone=?, expense_date=?, amount=?, gst_paid=?, category=?, invoice_number=?, payment_method=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [
                vendor_name, vendor_email || null, vendor_phone || null, expense_date,
                parseFloat(amount) || 0, parseFloat(gst_paid) || 0, category, invoice_number || null,
                payment_method || 'PENDING', description || '', req.params.id
            ],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ status: 'success', message: 'Expense updated' });
            }
        );
    }
);

app.patch('/api/expenses/:id/pay', (req, res) => {
    const amount = parseFloat(req.body.amount) || 0;
    if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    db.run(
        "UPDATE expenses SET amount_paid = MIN(amount_paid + ?, amount), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [amount, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', message: 'Payment recorded' });
        }
    );
});

app.delete('/api/expenses/:id', (req, res) => {
    db.run(
        "UPDATE expenses SET status='VOID', updated_at = CURRENT_TIMESTAMP WHERE id=?",
        [req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', message: 'Expense deleted' });
        }
    );
});

// ==========================================
// BANK LEDGER API
// ==========================================
app.get('/api/bank', (req, res) => {
    db.all(
        "SELECT * FROM bank_ledger ORDER BY txn_date DESC LIMIT 500",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', data: rows || [] });
        }
    );
});

app.post(
    '/api/bank',
    [
        body('txn_date').notEmpty(),
        body('description').notEmpty().trim(),
        body('txn_type').isIn(['IN', 'OUT']),
        body('amount').isFloat({ min: 0 })
    ],
    handleValidationErrors,
    (req, res) => {
        const { txn_date, description, txn_type, amount, reference_type, reference_id } = req.body;

        db.run(
            `INSERT INTO bank_ledger (txn_date, description, txn_type, amount, reference_type, reference_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [txn_date, description, txn_type, parseFloat(amount) || 0, reference_type || null, reference_id || null],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({
                    status: 'success',
                    message: 'Transaction recorded',
                    id: this.lastID
                });
            }
        );
    }
);

// ==========================================
// BANK RECONCILIATION API
// ==========================================
app.get('/api/bank/match', (req, res) => {
    const amount = parseFloat(req.query.amount) || 0;
    const type = req.query.type;

    if (type === 'IN') {
        db.all(
            "SELECT id, invoice_number, customer_name, total_amount, amount_paid FROM invoices WHERE status='ACTIVE' AND ABS((total_amount - amount_paid) - ?) < 0.01",
            [amount],
            (err, rows) => {
                res.json({ status: 'success', matches: rows || [], type: 'IN' });
            }
        );
    } else if (type === 'OUT') {
        db.all(
            "SELECT id, vendor_name, amount, amount_paid FROM expenses WHERE status='ACTIVE' AND ABS((amount - amount_paid) - ?) < 0.01",
            [amount],
            (err, rows) => {
                res.json({ status: 'success', matches: rows || [], type: 'OUT' });
            }
        );
    } else {
        res.status(400).json({ error: 'Invalid type' });
    }
});

// ==========================================
// BULK OPERATIONS API
// ==========================================
app.post('/api/bank/bulk', (req, res) => {
    const transactions = req.body || [];
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    db.serialize(() => {
        const stmt = db.prepare(
            `INSERT INTO bank_ledger (txn_date, description, txn_type, amount) VALUES (?, ?, ?, ?)`
        );
        let inserted = 0;
        transactions.forEach(t => {
            if (t.amount > 0 && t.txn_date && t.txn_type) {
                stmt.run([t.txn_date, t.description || '', t.txn_type, t.amount]);
                inserted++;
            }
        });
        stmt.finalize(() => {
            res.json({ status: 'success', message: `${inserted} transactions imported` });
        });
    });
});

// ==========================================
// AI INSIGHTS API
// ==========================================
app.post('/api/ai/insights', asyncHandler(async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    // Fetch dashboard data for context
    db.all("SELECT * FROM invoices WHERE status='ACTIVE'", [], (err, invoices) => {
        db.all("SELECT * FROM expenses WHERE status='ACTIVE'", [], (err, expenses) => {
            const context = {
                totalInvoices: invoices?.length || 0,
                totalExpenses: expenses?.length || 0,
                invoices: invoices?.slice(0, 5),
                expenses: expenses?.slice(0, 5)
            };

            getAIInsights(query, context).then(result => {
                res.json({ status: 'success', ...result });
            });
        });
    });
}));

app.get('/api/ai/logs', (req, res) => {
    db.all(
        "SELECT * FROM ai_logs ORDER BY created_at DESC LIMIT 100",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', data: rows || [] });
        }
    );
});

// ==========================================
// REPORTS API
// ==========================================
app.get('/api/reports/summary', (req, res) => {
    const startDate = req.query.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = req.query.end || new Date().toISOString().split('T')[0];

    db.serialize(() => {
        db.get(
            "SELECT COUNT(*) as total, SUM(total_amount) as amount FROM invoices WHERE invoice_date BETWEEN ? AND ?",
            [startDate, endDate],
            (err, invoiceStats) => {
                db.get(
                    "SELECT COUNT(*) as total, SUM(amount) as amount FROM expenses WHERE expense_date BETWEEN ? AND ?",
                    [startDate, endDate],
                    (err, expenseStats) => {
                        res.json({
                            status: 'success',
                            period: { start: startDate, end: endDate },
                            invoices: invoiceStats,
                            expenses: expenseStats,
                            netCashflow: (invoiceStats?.amount || 0) - (expenseStats?.amount || 0)
                        });
                    }
                );
            }
        );
    });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found'
    });
});

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
    console.log(`
${'='.repeat(50)}`);
    console.log(`✅ VLM ERP v2.0 running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/`);
    console.log(`🔌 API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`${'='.repeat(50)}\n`);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    db.close();
    process.exit(0);
});

module.exports = app;
