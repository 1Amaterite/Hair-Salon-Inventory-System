# Developer Setup Guide
## Hair Salon Inventory System - Quick Start Guide

### 🚀 Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for cloning the repository
- **PostgreSQL** database (or use the provided seed data)

---

## 📥 Step 1: Get the Code

### Option A: Clone Repository
```bash
git clone https://github.com/1Amaterite/Hair-Salon-Inventory-System.git
cd Hair-Salon-Inventory-System
```

### Option B: Download ZIP
1. Go to: https://github.com/1Amaterite/Hair-Salon-Inventory-System
2. Click "Code" → "Download ZIP"
3. Extract and navigate to the folder

---

## 📦 Step 2: Install Dependencies

### Backend Dependencies
```bash
npm install
```

### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### All Dependencies at Once
```bash
npm install && cd frontend && npm install && cd ..
```

---

## 🗄️ Step 3: Environment Setup

### Create Environment File
Create `.env` file in project root:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/inventory_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"
PORT=3000
```

### Database Setup
```bash
# Install PostgreSQL if not installed
sudo apt-get install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql                          # macOS

# Setup database
sudo -u postgres psql
CREATE DATABASE inventory_db;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO your_user;
\q
```

---

## 🌱 Step 4: Database Migration & Seeding

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed with sample data
npx prisma db seed
```

---

## 🔥 Step 5: Start the Application

### Option A: Use Startup Script (Recommended)
```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual Start
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 🌐 Step 6: Access the Application

### Frontend (Main App)
- **URL**: http://localhost:5173
- **Login**: Use credentials below

### Backend API
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

---

## 👤 Test Credentials

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full admin rights (create products, view financials, manage users)

### Staff User  
- **Username**: `staff`
- **Password**: `staff123`
- **Access**: Basic operations (create transactions, view products)

---

## 🧪 Step 7: Test Everything Works

### Basic Tests
1. **Login** with admin credentials
2. **View Products** - should show sample products
3. **Add Product** - create a new product
4. **Create Transaction** - add inbound/outbound transaction
5. **Check Stock** - verify stock calculations work

### API Testing (Optional)
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 🔧 Common Issues & Solutions

### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql
```

### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Frontend Build Issues
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Permission Issues
```bash
# Make startup script executable
chmod +x start.sh

# Fix file permissions
sudo chown -R $USER:$USER .
```

---

## 📱 Project Structure Overview

```
Hair-Salon-Inventory-System/
├── 📁 backend/
│   ├── 📁 controllers/     # API logic
│   ├── 📁 services/        # Business logic
│   ├── 📁 middleware/      # Auth, validation
│   ├── 📁 routes/          # API endpoints
│   ├── 📁 validators/       # Input validation
│   └── 📁 prisma/          # Database schema & migrations
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 api/         # API calls
│   │   ├── 📁 pages/       # React components
│   │   └── 📁 components/   # Reusable UI
│   └── 📄 package.json
├── 📄 start.sh              # Quick startup script
└── 📄 DEVELOPER_GUIDE.md   # This file!
```

---

## 🎯 Quick Commands Reference

```bash
# Start everything
./start.sh

# Backend only
npm run dev

# Frontend only
cd frontend && npm run dev

# Database operations
npx prisma studio          # Visual database browser
npx prisma migrate dev      # Apply schema changes
npx prisma db seed         # Reset sample data

# Git operations
git add .
git commit -m "your changes"
git push origin main
```

---

## 🆘 Need Help?

### Check Logs
- **Backend**: Look at terminal where you ran `npm run dev`
- **Frontend**: Browser console (F12) and terminal output

### Common Port Issues
- **Backend**: 3000
- **Frontend**: 5173 (or 5176 if 5173 is busy)

### Database Reset
```bash
# Completely reset database
npx prisma migrate reset
npx prisma db seed
```

---

## 🎉 You're Ready!

Once you complete these steps, you'll have:
- ✅ Working backend API with authentication
- ✅ React frontend with product/transaction management
- ✅ Database with sample data
- ✅ Full CRUD operations for products
- ✅ Transaction creation and stock tracking

**Happy coding!** 🚀

---

*Last updated: April 2026*
