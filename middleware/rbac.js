/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides role-based route protection
 */

/**
 * Require specific role to access route
 * @param {string|string[]} allowedRoles - Role(s) that are allowed to access the route
 * @returns {Function} Express middleware function
 */
function requireRole(allowedRoles) {
  // Convert to array if single role provided
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Check if user is authenticated and has role
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

/**
 * Require ADMIN role to access route
 * @returns {Function} Express middleware function
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      required: 'ADMIN',
      current: req.user.role
    });
  }

  next();
}

/**
 * Require STAFF role or higher to access route
 * @returns {Function} Express middleware function
 */
function requireStaff(req, res, next) {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const allowedRoles = ['STAFF', 'ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff access required',
      required: allowedRoles,
      current: req.user.role
    });
  }

  next();
}

/**
 * Check if user can perform action based on role
 * @param {string} action - Action type (e.g., 'create', 'read', 'update', 'delete')
 * @param {string} resource - Resource type (e.g., 'user', 'product', 'transaction')
 * @returns {Function} Express middleware function
 */
function canPerform(action, resource) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const permissions = getPermissions(req.user.role);
    const resourcePermissions = permissions[resource] || {};

    if (!resourcePermissions[action]) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions to ${action} ${resource}`,
        required: `${action}:${resource}`,
        current: req.user.role
      });
    }

    next();
  };
}

/**
 * Get permissions for a specific role
 * @param {string} role - User role
 * @returns {Object} Permissions object
 */
function getPermissions(role) {
  const permissions = {
    ADMIN: {
      user: { create: true, read: true, update: true, delete: true },
      product: { create: true, read: true, update: true, delete: true },
      transaction: { create: true, read: true, update: true, delete: true },
      audit: { read: true },
      adjustment: { create: true }
    },
    STAFF: {
      user: { create: false, read: true, update: false, delete: false },
      product: { create: false, read: true, update: false, delete: false },
      transaction: { create: true, read: true, update: false, delete: false },
      audit: { read: false },
      adjustment: { create: false }
    }
  };

  return permissions[role] || {};
}

/**
 * Middleware to check if user can access their own resources
 * @param {string} resourceParam - Parameter name containing user ID (e.g., 'userId', 'id')
 * @returns {Function} Express middleware function
 */
function canAccessOwnResource(resourceParam = 'userId') {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const resourceUserId = req.params[resourceParam] || req.body[resourceParam];
    
    // Admin can access any resource
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Staff can only access their own resources
    if (req.user.userId !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: 'Can only access own resources',
        required: req.user.userId,
        attempted: resourceUserId
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireAdmin,
  requireStaff,
  canPerform,
  canAccessOwnResource,
  getPermissions
};
