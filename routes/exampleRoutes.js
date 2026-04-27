const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireStaff, requireRole } = require('../middleware/rbac');

/**
 * GET /example/public
 * Public endpoint - no authentication required
 */
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This is a public endpoint - no authentication required',
    data: {
      timestamp: new Date().toISOString(),
      endpoint: '/example/public'
    }
  });
});

/**
 * GET /example/protected
 * Protected endpoint - authentication required (any role)
 */
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This is a protected endpoint - authentication required',
    data: {
      user: {
        userId: req.user.userId,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role
      },
      timestamp: new Date().toISOString(),
      endpoint: '/example/protected'
    }
  });
});

/**
 * GET /example/admin-only
 * Admin only endpoint - requires ADMIN role
 */
router.get('/admin-only', authenticateToken, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This is an admin-only endpoint - ADMIN role required',
    data: {
      user: {
        userId: req.user.userId,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role
      },
      timestamp: new Date().toISOString(),
      endpoint: '/example/admin-only',
      adminData: {
        systemInfo: 'Only admins can see this',
        sensitiveMetrics: 'Admin-level data here'
      }
    }
  });
});

/**
 * GET /example/staff-or-admin
 * Staff or Admin endpoint - requires STAFF or ADMIN role
 */
router.get('/staff-or-admin', authenticateToken, requireStaff, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint requires STAFF or ADMIN role',
    data: {
      user: {
        userId: req.user.userId,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role
      },
      timestamp: new Date().toISOString(),
      endpoint: '/example/staff-or-admin',
      staffData: {
        operationalInfo: 'Staff and admins can see this',
        businessMetrics: 'Operational data here'
      }
    }
  });
});

/**
 * GET /example/role-specific
 * Role-specific response based on user role
 */
router.get('/role-specific', authenticateToken, (req, res) => {
  const userRole = req.user.role;
  
  let responseData = {
    success: true,
    message: `Role-specific response for ${userRole}`,
    data: {
      user: {
        userId: req.user.userId,
        username: req.user.username,
        name: req.user.name,
        role: userRole
      },
      timestamp: new Date().toISOString(),
      endpoint: '/example/role-specific'
    }
  };

  // Add role-specific data
  switch (userRole) {
    case 'ADMIN':
      responseData.data.roleInfo = {
        accessLevel: 'Full system access',
        permissions: ['create', 'read', 'update', 'delete'],
        adminFeatures: 'User management, system settings, full audit logs'
      };
      break;
    case 'STAFF':
      responseData.data.roleInfo = {
        accessLevel: 'Operational access',
        permissions: ['read', 'create transactions'],
        staffFeatures: 'Product viewing, transaction creation, basic reports'
      };
      break;
    default:
      responseData.data.roleInfo = {
        accessLevel: 'Limited access',
        permissions: ['read'],
        features: 'Basic viewing only'
      };
  }

  res.status(200).json(responseData);
});

/**
 * POST /example/adjustment
 * Example of ADJUSTMENT transaction (ADMIN only)
 */
router.post('/adjustment', authenticateToken, requireAdmin, (req, res) => {
  const { productId, quantity, remarks } = req.body;

  // Simulate ADJUSTMENT transaction logic
  res.status(200).json({
    success: true,
    message: 'ADJUSTMENT transaction created (ADMIN only)',
    data: {
      transaction: {
        id: 'adj_' + Date.now(),
        productId,
        quantity,
        remarks,
        type: 'ADJUSTMENT',
        createdBy: req.user.username,
        createdAt: new Date().toISOString()
      },
      user: {
        userId: req.user.userId,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
});

module.exports = router;
