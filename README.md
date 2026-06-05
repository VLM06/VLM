# VLM ERP - Enterprise Resource Planning System

![Build Status](https://github.com/VLM06/VLM/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Complete ERP Solution with User Self-Registration

A modern, secure, and scalable Enterprise Resource Planning system built with Node.js, React, and MongoDB.

### ✨ Features
- ✅ User Self-Registration & Authentication
- ✅ Dashboard with Analytics
- ✅ Inventory Management
- ✅ Sales Module
- ✅ Reports & Analytics
- ✅ Multi-user Support
- ✅ Role-based Access Control (RBAC)
- ✅ JWT Token-based Authentication
- ✅ Rate Limiting & Security
- ✅ Docker Support
- ✅ CI/CD Pipelines

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Custom middleware

### Frontend
- **Library**: React 18+
- **Package Manager**: npm/yarn
- **Styling**: CSS3

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Firebase, Heroku, AWS EC2

## 📋 Quick Start

### Prerequisites
- Node.js v16+ ([Download](https://nodejs.org/))
- MongoDB ([Local](https://www.mongodb.com/docs/manual/installation/) or [Cloud](https://www.mongodb.com/cloud/atlas))
- Git

### Installation

#### Option 1: Local Setup

```bash
# Clone repository
git clone https://github.com/VLM06/VLM.git
cd VLM

# Backend Setup
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm start

# Frontend Setup (new terminal)
cd frontend
cp .env.example .env
npm install
npm start
```

#### Option 2: Docker Setup

```bash
git clone https://github.com/VLM06/VLM.git
cd VLM

# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔗 Access Points

| Service | URL | Default Port |
|---------|-----|---------------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| MongoDB | mongodb://localhost:27017 | 27017 |

## 📚 Documentation

- **[Setup Guide](./SETUP.md)** - Detailed installation instructions
- **[API Documentation](./API.md)** - Complete API endpoint reference
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Firebase, Heroku, AWS
- **[Contributing](./CONTRIBUTING.md)** - How to contribute

## 🔐 Default Credentials

⚠️ **CHANGE IMMEDIATELY AFTER FIRST LOGIN!**

```
Email:    admin@vlm.com
Password: Admin@123
```

## 📂 Project Structure

```
VLM/
├── backend/                  # Node.js/Express backend
│   ├── middleware/          # Authentication, validation, error handling
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── server.js            # Main server file
│   └── package.json
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .github/workflows/       # GitHub Actions CI/CD
├── docker-compose.yml       # Local development
├── docker-compose.prod.yml  # Production
├── Dockerfile.backend       # Backend container
├── Dockerfile.frontend      # Frontend container
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── API.md                   # API documentation
├── SETUP.md                 # Setup instructions
├── DEPLOYMENT.md            # Deployment guide
└── README.md               # This file
```

## 🔑 API Endpoints

### Authentication
```
POST   /api/register     - User registration
POST   /api/login        - User login
```

### Dashboard
```
GET    /api/dashboard    - Get dashboard data
```

### Inventory
```
GET    /api/inventory    - List all inventory
POST   /api/inventory    - Add new inventory
GET    /api/inventory/:id - Get inventory by ID
PUT    /api/inventory/:id - Update inventory
DELETE /api/inventory/:id - Delete inventory
```

### Sales
```
GET    /api/sales        - List all sales
POST   /api/sales        - Create new sale
```

### Reports
```
GET    /api/reports      - Generate reports
```

👉 See [API.md](./API.md) for complete documentation

## 🚀 Deployment

### Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
cd frontend && npm run build
firebase deploy
```

### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Heroku
```bash
heroku create vlm-erp-backend
git push heroku main
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🔒 Security Features

- ✅ Input validation and sanitization
- ✅ JWT token authentication
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Password strength requirements
- ✅ CORS protection
- ✅ Environment variables for secrets
- ✅ Error handling without exposing sensitive data
- ✅ MongoDB injection prevention

## 🧪 Testing

```bash
cd backend
npm install --save-dev jest supertest
npm test
```

## 📊 CI/CD Pipeline

Automated workflows on every push:
- ✅ Code linting (ESLint)
- ✅ Unit tests
- ✅ Build verification
- ✅ Automatic deployment to Firebase (main branch)

See [.github/workflows](./.github/workflows) for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 💬 Support

- 📧 Email: support@vlm.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/VLM06/VLM/issues)
- 💡 Suggest features: [GitHub Discussions](https://github.com/VLM06/VLM/discussions)
- 📖 Read docs: [Full Documentation](./SETUP.md)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] API rate limiting by tier
- [ ] Real-time collaboration
- [ ] Cloud backup integration
- [ ] Mobile payment integration

## ✨ Recent Improvements

v1.1.0 (Current)
- ✅ Added environment variable management
- ✅ Implemented security middleware
- ✅ Added rate limiting
- ✅ Created GitHub Actions CI/CD
- ✅ Added Docker support
- ✅ Comprehensive documentation
- ✅ Input validation & sanitization
- ✅ Error handling improvements

## 👨‍💻 Author

**VLM06** - [GitHub Profile](https://github.com/VLM06)

## 🙏 Acknowledgments

- MongoDB documentation
- Express.js community
- React documentation
- Firebase team

---

**⭐ If you find this project helpful, please consider giving it a star!**

Last Updated: June 2026
