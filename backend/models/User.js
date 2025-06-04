const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'operator', 'technician', 'viewer'],
    default: 'viewer'
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    department: String,
    position: String
  },
  permissions: [{
    type: String,
    enum: [
      'system_control', 'system_view', 'liquid_manage', 'liquid_view',
      'maintenance_schedule', 'maintenance_view', 'analytics_view',
      'user_manage', 'settings_manage', 'alerts_manage'
    ]
  }],
  preferences: {
    language: { type: String, default: 'tr' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      alerts: { type: Boolean, default: true }
    },
    dashboard: {
      refreshInterval: { type: Number, default: 30 }, // seconds
      defaultView: { type: String, default: 'overview' }
    }
  },
  loginHistory: [{
    loginTime: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    success: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to check permissions
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'admin') return true;
  return this.permissions.includes(permission);
};

// Method to add login history
userSchema.methods.addLoginHistory = function(ipAddress, userAgent, success = true) {
  this.loginHistory.push({
    ipAddress,
    userAgent,
    success,
    loginTime: new Date()
  });
  
  // Keep only last 10 login records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  
  if (success) {
    this.lastLogin = new Date();
  }
  
  return this.save();
};

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role') || this.isNew) {
    switch (this.role) {
      case 'admin':
        this.permissions = [
          'system_control', 'system_view', 'liquid_manage', 'liquid_view',
          'maintenance_schedule', 'maintenance_view', 'analytics_view',
          'user_manage', 'settings_manage', 'alerts_manage'
        ];
        break;
      case 'operator':
        this.permissions = [
          'system_control', 'system_view', 'liquid_manage', 'liquid_view',
          'maintenance_view', 'analytics_view', 'alerts_manage'
        ];
        break;
      case 'technician':
        this.permissions = [
          'system_view', 'liquid_view', 'maintenance_schedule', 
          'maintenance_view', 'analytics_view'
        ];
        break;
      case 'viewer':
        this.permissions = ['system_view', 'liquid_view', 'analytics_view'];
        break;
    }
  }
  next();
});

// Static method to get role hierarchy
userSchema.statics.getRoleHierarchy = function() {
  return {
    admin: 4,
    operator: 3,
    technician: 2,
    viewer: 1
  };
};

// Method to check if user has higher or equal role
userSchema.methods.hasRoleLevel = function(requiredRole) {
  const hierarchy = this.constructor.getRoleHierarchy();
  return hierarchy[this.role] >= hierarchy[requiredRole];
};

module.exports = mongoose.model('User', userSchema); 