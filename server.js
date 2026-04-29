require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const productRoutes = require('./routes/productRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const orderRoutes = require('./routes/orderRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/orders', orderRoutes);

// Basic Route for Testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Hair Salon Inventory System API',
        version: '1.0.0',
        authentication: 'JWT-based with role-based access control',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile',
                logout: 'POST /api/auth/logout',
                verify: 'GET /api/auth/verify'
            },
            products: {
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                create: 'POST /api/products (ADMIN only)',
                update: 'PUT /api/products/:id (ADMIN only)',
                delete: 'DELETE /api/products/:id (ADMIN only)',
                restore: 'POST /api/products/:id/restore (ADMIN only)',
                categories: 'GET /api/products/categories',
                statistics: 'GET /api/products/statistics'
            },
            transactions: '/api/transactions',
            health: '/api/health'
        },
        usage: {
            login: 'Use POST /api/auth/login with username/password to get JWT token',
            authentication: 'Include "Authorization: Bearer <token>" header for protected routes',
            roles: 'ADMIN and STAFF roles with different permission levels'
        }
    });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'Connected'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Inventory System Server is running on http://localhost:${PORT}`);
    console.log('Ctrl + C to stop');
});