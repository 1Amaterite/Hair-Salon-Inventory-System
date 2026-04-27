const express = require('express');
const router = express.Router();
const { login, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /auth/login
 * User login - returns JWT token
 * Public endpoint (no authentication required)
 */
router.post('/login', login);

/**
 * GET /auth/profile
 * Get current user profile
 * Protected endpoint (authentication required)
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * POST /auth/logout
 * User logout (creates audit log)
 * Protected endpoint (authentication required)
 */
router.post('/logout', authenticateToken, logout);

/**
 * GET /auth/verify
 * Verify JWT token is valid
 * Protected endpoint (authentication required)
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        userId: req.user.userId,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role
      }
    }
  });
});

module.exports = router;