# VLM ERP Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/VLM06/VLM.git
cd VLM
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vlm-erp
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Start backend:
```bash
npm start
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
```

Start frontend:
```bash
npm start
```

Access app: http://localhost:3000

## MongoDB Setup

### Option A: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB
3. Default: `mongodb://localhost:27017/vlm-erp`

### Option B: MongoDB Atlas (Cloud)
1. Register at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/vlm-erp`
4. Update `.env` with MONGO_URI

## Default Credentials
- Email: admin@vlm.com
- Password: admin123

## Production Deployment

### Heroku Deployment
1. Create Heroku account
2. Install Heroku CLI
3. `heroku login`
4. `heroku create vlm-erp-app`
5. `git push heroku main`

### Environment Variables for Production
```
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
```

## API Endpoints

### Authentication
- POST /api/register
- POST /api/login

### Dashboard
- GET /api/dashboard

### Inventory
- POST /api/inventory
- GET /api/inventory
- GET /api/inventory/:id
- PUT /api/inventory/:id
- DELETE /api/inventory/:id

### Sales
- POST /api/sales
- GET /api/sales
- GET /api/sales/:id
- PUT /api/sales/:id

### Reports
- GET /api/reports

### Users
- GET /api/users
- GET /api/profile

## Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running
- Verify MONGO_URI in .env
- Check network connectivity

### Port Already in Use
- Change PORT in .env
- Kill process: `lsof -ti:5000 | xargs kill -9`

### CORS Errors
- Ensure backend is running on port 5000
- Frontend configured to http://localhost:5000

## Support
For issues, create an issue on GitHub or contact: support@vlm.com
