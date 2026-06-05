// MongoDB Setup Instructions for VLM ERP

// Option 1: Local MongoDB Setup
// 1. Download MongoDB from: https://www.mongodb.com/try/download/community
// 2. Install and run MongoDB
// 3. Default connection: mongodb://localhost:27017/vlm-erp

// Option 2: Cloud MongoDB Setup (Recommended)
// 1. Go to: https://www.mongodb.com/cloud/atlas
// 2. Create free account
// 3. Create cluster
// 4. Get connection string
// 5. Update .env file with MONGO_URI

// Collections created automatically by Mongoose:
// - users
// - inventories
// - sales

// Example .env file:
// PORT=5000
// MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vlm-erp?retryWrites=true&w=majority
// JWT_SECRET=your-secret-key
// NODE_ENV=development
