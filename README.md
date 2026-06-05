# VLM ERP - Enterprise Resource Planning System

## Complete ERP Solution with User Self-Registration

### Features
- ✅ User Self-Registration & Authentication
- ✅ Dashboard with Analytics
- ✅ Inventory Management
- ✅ Sales Module
- ✅ Reports & Analytics
- ✅ Multi-user Support
- ✅ Role-based Access Control

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on: http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
App runs on: http://localhost:3000

### Database
MongoDB (local or cloud): mongodb://localhost:27017/vlm-erp

## Project Structure
```
vlm-erp/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   ├── models/
│   └── middleware/
├── frontend/
│   ├── src/
│   ├── App.js
│   └── package.json
└── README.md
```

## API Endpoints
- POST /api/register - User registration
- POST /api/login - User login
- GET /api/dashboard - Dashboard data
- POST /api/inventory - Add inventory
- GET /api/inventory - Get all inventory
- POST /api/sales - Create sale
- GET /api/sales - Get all sales
- GET /api/reports - Generate reports

## Default Credentials
Admin: admin@vlm.com / admin123

## Support
For issues, contact: support@vlm.com
