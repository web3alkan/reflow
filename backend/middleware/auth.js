const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Token bulunamadı.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'reflow-secret-key');

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token geçersiz. Kullanıcı bulunamadı.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesap devre dışı bırakılmış.'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Şifre değiştirilmiş. Lütfen tekrar giriş yapın.'
      });
    }

    // Add user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Yetkilendirme hatası.',
      error: error.message
    });
  }
};

// Permission-based authorization middleware
const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Kimlik doğrulanmamış.'
      });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has required permissions
    const hasPermission = permissions.some(permission => 
      req.user.hasPermission(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Erişim reddedildi. Yeterli yetki yok.',
        requiredPermissions: permissions,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

// Role-based authorization middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Kimlik doğrulanmamış.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Erişim reddedildi. Gerekli rol yok.',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Minimum role level authorization
const requireRoleLevel = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Kimlik doğrulanmamış.'
      });
    }

    if (!req.user.hasRoleLevel(minRole)) {
      return res.status(403).json({
        success: false,
        message: 'Erişim reddedildi. Yeterli yetki seviyesi yok.',
        requiredLevel: minRole,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'reflow-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting by user
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequestCounts = new Map();

  return (req, res, next) => {
    const userId = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, data] of userRequestCounts.entries()) {
      if (data.resetTime < now) {
        userRequestCounts.delete(key);
      }
    }

    // Get or create user request data
    let userData = userRequestCounts.get(userId);
    if (!userData || userData.resetTime < now) {
      userData = {
        count: 0,
        resetTime: now + windowMs
      };
      userRequestCounts.set(userId, userData);
    }

    // Check rate limit
    if (userData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
        retryAfter: Math.ceil((userData.resetTime - now) / 1000)
      });
    }

    // Increment counter
    userData.count++;
    next();
  };
};

// Middleware to log user actions
const logUserAction = (action) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`[${new Date().toISOString()}] User ${req.user.username} (${req.user.role}) performed action: ${action}`);
    }
    next();
  };
};

module.exports = {
  auth,
  authorize,
  requireRole,
  requireRoleLevel,
  optionalAuth,
  rateLimitByUser,
  logUserAction
}; 