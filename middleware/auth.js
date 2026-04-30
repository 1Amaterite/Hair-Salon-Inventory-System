const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * JWT Authentication Middleware
 * Protects routes by verifying JWT tokens and attaching user to request
 */
function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        
        // Handle different JWT errors
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }

        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }

      // Get fresh user data from database
      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            isActive: true
          }
        });

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        if (!user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Account is deactivated'
          });
        }

        // Attach user to request object
        req.user = {
          userId: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          isActive: user.isActive
        };

        next();
      } catch (dbError) {
        console.error('Database error during authentication:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Internal server error during authentication'
        });
      }
    });

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Admin Role Middleware
 * Ensures the authenticated user has ADMIN role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
}

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is present, but doesn't block if not
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    // If token is present, verify it
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        // Invalid token, continue without authentication
        return next();
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            isActive: true
          }
        });

        if (user && user.isActive) {
          req.user = {
            userId: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            isActive: user.isActive
          };
        }

        next();
      } catch (dbError) {
        // Database error, continue without authentication
        next();
      }
    });

  } catch (error) {
    // Error in middleware, continue without authentication
    next();
  }
}

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
