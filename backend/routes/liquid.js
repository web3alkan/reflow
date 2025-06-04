const express = require('express');
const router = express.Router();
const Liquid = require('../models/Liquid');
const auth = require('../middleware/auth');

// GET /api/liquid - Get all liquids with filtering
router.get('/', auth, async (req, res) => {
  try {
    const {
      type,
      status,
      contamination,
      lowStock,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Apply filters
    if (type) query.type = type;
    if (status) query['quality.status'] = status;
    if (contamination) {
      const contaminationLevel = parseInt(contamination);
      query['contamination.level'] = { $gte: contaminationLevel };
    }
    if (lowStock === 'true') {
      const threshold = parseInt(req.query.threshold) || 10;
      query['quantity.current'] = { $lt: threshold };
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const liquids = await Liquid.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Liquid.countDocuments(query);

    res.json({
      success: true,
      data: liquids,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sıvı verileri alınırken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/liquid/:id - Get specific liquid
router.get('/:id', auth, async (req, res) => {
  try {
    const liquid = await Liquid.findById(req.params.id);
    
    if (!liquid) {
      return res.status(404).json({
        success: false,
        message: 'Sıvı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: liquid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sıvı verisi alınırken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/liquid - Create new liquid
router.post('/', auth, async (req, res) => {
  try {
    const liquidData = req.body;
    
    // Generate unique liquid ID if not provided
    if (!liquidData.liquidId) {
      liquidData.liquidId = `LIQ_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    const liquid = new Liquid(liquidData);
    await liquid.save();

    res.status(201).json({
      success: true,
      message: 'Sıvı başarıyla oluşturuldu',
      data: liquid
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu sıvı ID\'si zaten mevcut'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Sıvı oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/liquid/:id - Update liquid
router.put('/:id', auth, async (req, res) => {
  try {
    const liquid = await Liquid.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!liquid) {
      return res.status(404).json({
        success: false,
        message: 'Sıvı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Sıvı başarıyla güncellendi',
      data: liquid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sıvı güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// DELETE /api/liquid/:id - Delete liquid
router.delete('/:id', auth, async (req, res) => {
  try {
    const liquid = await Liquid.findByIdAndDelete(req.params.id);

    if (!liquid) {
      return res.status(404).json({
        success: false,
        message: 'Sıvı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Sıvı başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sıvı silinirken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/liquid/:id/contamination - Update contamination levels
router.post('/:id/contamination', auth, async (req, res) => {
  try {
    const { level, particles } = req.body;
    
    const liquid = await Liquid.findById(req.params.id);
    if (!liquid) {
      return res.status(404).json({
        success: false,
        message: 'Sıvı bulunamadı'
      });
    }

    // Update contamination data
    liquid.contamination.level = level;
    liquid.contamination.particles = particles;
    liquid.contamination.lastTested = new Date();

    // Update quality status based on contamination
    if (level < 10) liquid.quality.status = 'excellent';
    else if (level < 30) liquid.quality.status = 'good';
    else if (level < 60) liquid.quality.status = 'acceptable';
    else if (level < 80) liquid.quality.status = 'poor';
    else liquid.quality.status = 'unusable';

    // Add alert if contamination is high
    if (level > 70) {
      liquid.alerts.push({
        type: 'high_contamination',
        message: `Kontaminasyon seviyesi yüksek: %${level}`,
        severity: level > 85 ? 'critical' : 'high'
      });
    }

    await liquid.save();

    res.json({
      success: true,
      message: 'Kontaminasyon verileri güncellendi',
      data: liquid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kontaminasyon verileri güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/liquid/:id/recycle - Record recycling operation
router.post('/:id/recycle', auth, async (req, res) => {
  try {
    const { recoveredAmount, efficiency } = req.body;
    
    const liquid = await Liquid.findById(req.params.id);
    if (!liquid) {
      return res.status(404).json({
        success: false,
        message: 'Sıvı bulunamadı'
      });
    }

    // Update recycling data
    liquid.recycling.cycles += 1;
    liquid.recycling.totalRecovered += recoveredAmount;
    liquid.recycling.efficiency = efficiency;
    liquid.recycling.lastRecycled = new Date();

    // Update quantity
    liquid.quantity.current += recoveredAmount;

    // Reset contamination after recycling
    liquid.contamination.level = Math.max(0, liquid.contamination.level - 50);
    
    // Update quality status
    if (liquid.contamination.level < 30) {
      liquid.quality.status = 'good';
    }

    await liquid.save();

    res.json({
      success: true,
      message: 'Geri dönüşüm işlemi kaydedildi',
      data: liquid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Geri dönüşüm işlemi kaydedilirken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/liquid/analytics/summary - Get analytics summary
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const totalLiquids = await Liquid.countDocuments();
    const lowStockLiquids = await Liquid.countDocuments({ 'quantity.current': { $lt: 10 } });
    const highContamination = await Liquid.countDocuments({ 'contamination.level': { $gte: 70 } });
    
    // Calculate total recovery
    const recoveryStats = await Liquid.aggregate([
      {
        $group: {
          _id: null,
          totalRecovered: { $sum: '$recycling.totalRecovered' },
          totalOriginal: { $sum: '$quantity.original' },
          averageEfficiency: { $avg: '$recycling.efficiency' },
          totalCycles: { $sum: '$recycling.cycles' }
        }
      }
    ]);

    const recovery = recoveryStats[0] || {
      totalRecovered: 0,
      totalOriginal: 0,
      averageEfficiency: 0,
      totalCycles: 0
    };

    const recoveryRate = recovery.totalOriginal > 0 
      ? ((recovery.totalRecovered / recovery.totalOriginal) * 100).toFixed(2)
      : 0;

    // Environmental impact
    const environmentalImpact = {
      wasteReduced: recovery.totalRecovered,
      carbonFootprintSaved: recovery.totalRecovered * 2.3, // kg CO2 per liter
      costSaved: recovery.totalRecovered * 45 // TL per liter
    };

    res.json({
      success: true,
      data: {
        inventory: {
          total: totalLiquids,
          lowStock: lowStockLiquids,
          highContamination
        },
        recovery: {
          totalRecovered: recovery.totalRecovered,
          recoveryRate: parseFloat(recoveryRate),
          averageEfficiency: recovery.averageEfficiency || 0,
          totalCycles: recovery.totalCycles
        },
        environmental: environmentalImpact
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Analitik verileri alınırken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/liquid/alerts/active - Get active alerts
router.get('/alerts/active', auth, async (req, res) => {
  try {
    const liquids = await Liquid.find({
      'alerts.resolved': false
    }).select('liquidId type alerts brand quantity.current');

    const activeAlerts = [];
    
    liquids.forEach(liquid => {
      liquid.alerts.filter(alert => !alert.resolved).forEach(alert => {
        activeAlerts.push({
          liquidId: liquid.liquidId,
          liquidType: liquid.type,
          liquidBrand: liquid.brand,
          alert: {
            id: alert._id,
            type: alert.type,
            message: alert.message,
            severity: alert.severity,
            createdAt: alert.createdAt
          }
        });
      });
    });

    // Sort by severity and creation time
    activeAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aSeverity = severityOrder[a.alert.severity] || 0;
      const bSeverity = severityOrder[b.alert.severity] || 0;
      
      if (aSeverity !== bSeverity) return bSeverity - aSeverity;
      return new Date(b.alert.createdAt) - new Date(a.alert.createdAt);
    });

    res.json({
      success: true,
      data: activeAlerts,
      total: activeAlerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Aktif alarmlar alınırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 