const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'reflow-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// POST /api/auth/register - Register new user (admin only)
router.post('/register', auth, requireRole('admin'), async (req, res) => {
  try {
    const { username, email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      role: role || 'viewer',
      profile: profile || {}
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          permissions: user.permissions
        },
        token
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Kullanıcı oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gerekli'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz giriş bilgileri'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesap devre dışı bırakılmış'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Add failed login attempt
      await user.addLoginHistory(req.ip, req.get('User-Agent'), false);
      
      return res.status(401).json({
        success: false,
        message: 'Geçersiz giriş bilgileri'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Add successful login to history
    await user.addLoginHistory(req.ip, req.get('User-Agent'), true);

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          profile: user.profile,
          permissions: user.permissions,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Giriş yapılırken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          profile: user.profile,
          permissions: user.permissions,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: {
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/auth/change-password - Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre ve yeni şifre gerekli'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre yanlış'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilirken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    // In a real application, you would send an email here
    // For development, we'll return the token
    res.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi',
      resetToken: resetToken // Remove this in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlama işlemi başlatılırken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token ve yeni şifre gerekli'
      });
    }

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlanırken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/auth/users - Get all users (admin only)
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, active } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (active !== undefined) query.isActive = active === 'true';

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınırken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/auth/users/:id - Update user (admin only)
router.put('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { role, isActive, profile, permissions } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Update fields
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (permissions) user.permissions = permissions;

    await user.save();

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/auth/logout - Logout (client-side token invalidation)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token from storage
    
    res.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Çıkış yapılırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 