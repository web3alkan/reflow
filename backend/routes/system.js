const express = require('express');
const router = express.Router();
const System = require('../models/System');
const auth = require('../middleware/auth');

// GET /api/system - Get all systems
router.get('/', auth, async (req, res) => {
  try {
    const { status, health, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const systems = await System.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by health if specified
    let filteredSystems = systems;
    if (health) {
      filteredSystems = systems.filter(system => system.health === health);
    }

    const total = await System.countDocuments(query);

    res.json({
      success: true,
      data: filteredSystems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem verileri alınırken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/system/:id - Get specific system
router.get('/:id', auth, async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Sistem bulunamadı'
      });
    }

    res.json({
      success: true,
      data: system
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem verisi alınırken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/system - Create new system
router.post('/', auth, async (req, res) => {
  try {
    const system = new System(req.body);
    await system.save();

    res.status(201).json({
      success: true,
      message: 'Sistem başarıyla oluşturuldu',
      data: system
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/system/:id - Update system
router.put('/:id', auth, async (req, res) => {
  try {
    const system = await System.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Sistem bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Sistem başarıyla güncellendi',
      data: system
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/system/:id/start - Start system operation
router.post('/:id/start', auth, async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Sistem bulunamadı'
      });
    }

    if (system.operational.isRunning) {
      return res.status(400).json({
        success: false,
        message: 'Sistem zaten çalışıyor'
      });
    }

    // Start system
    system.status = 'active';
    system.operational.isRunning = true;
    system.operational.startTime = new Date();
    
    await system.save();

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('systemStatus', {
        systemId: system.systemId,
        status: 'started',
        message: 'Sistem başlatıldı'
      });
    }

    res.json({
      success: true,
      message: 'Sistem başarıyla başlatıldı',
      data: system
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem başlatılırken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/system/:id/stop - Stop system operation
router.post('/:id/stop', auth, async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Sistem bulunamadı'
      });
    }

    if (!system.operational.isRunning) {
      return res.status(400).json({
        success: false,
        message: 'Sistem zaten durdurulmuş'
      });
    }

    // Calculate uptime
    const runTime = Date.now() - system.operational.startTime;
    system.operational.uptime += runTime;

    // Stop system
    system.status = 'inactive';
    system.operational.isRunning = false;
    system.operational.startTime = null;
    
    await system.save();

    // Emit socket event
    if (req.io) {
      req.io.emit('systemStatus', {
        systemId: system.systemId,
        status: 'stopped',
        message: 'Sistem durduruldu'
      });
    }

    res.json({
      success: true,
      message: 'Sistem başarıyla durduruldu',
      data: system
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem durdurulurken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/system/:id/sensors - Update sensor data
router.post('/:id/sensors', auth, async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Sistem bulunamadı'
      });
    }

    const { sensorType, value } = req.body;
    
    if (!system.sensors[sensorType]) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz sensör tipi'
      });
    }

    // Update sensor data
    system.sensors[sensorType].current = value;
    system.sensors[sensorType].lastReading = new Date();

    // Check for alarms based on sensor values
    const checkAndAddAlarm = (type, current, min, max, message) => {
      if ((min && current < min) || (max && current > max)) {
        system.addAlarm(type, message, 'warning');
      }
    };

    switch (sensorType) {
      case 'pressure':
        checkAndAddAlarm('high_pressure', value, null, system.sensors.pressure.max, 
          `Basınç yüksek: ${value} ${system.sensors.pressure.unit}`);
        break;
      case 'temperature':
        checkAndAddAlarm('system_error', value, system.sensors.temperature.min, system.sensors.temperature.max,
          `Sıcaklık aralık dışında: ${value}°C`);
        break;
      case 'liquidLevel':
        checkAndAddAlarm('low_level', value, system.sensors.liquidLevel.min, null,
          `Sıvı seviyesi düşük: %${value}`);
        break;
      case 'turbidity':
        if (value > system.sensors.turbidity.threshold) {
          system.addAlarm('filter_blocked', `Bulanıklık yüksek: ${value} NTU`, 'warning');
        }
        break;
    }

    await system.save();

    // Emit real-time sensor data
    if (req.io) {
      req.io.emit('sensorData', {
        systemId: system.systemId,
        sensorType,
        value,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Sensör verisi güncellendi',
      data: {
        sensorType,
        value,
        timestamp: system.sensors[sensorType].lastReading
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sensör verisi güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/system/:id/status - Get system status summary
router.get('/:id/status', auth, async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Sistem bulunamadı'
      });
    }

    const statusSummary = {
      systemId: system.systemId,
      name: system.name,
      status: system.status,
      health: system.health,
      isRunning: system.operational.isRunning,
      uptime: system.calculateUptime(),
      efficiency: system.operational.efficiency,
      activeAlarms: system.alarms.filter(alarm => alarm.active).length,
      criticalAlarms: system.alarms.filter(alarm => alarm.active && alarm.severity === 'critical').length,
      maintenanceDue: system.isMaintenanceDue(),
      lastUpdate: system.updatedAt,
      sensors: {
        flowRate: system.sensors.flowRate.current,
        pressure: system.sensors.pressure.current,
        temperature: system.sensors.temperature.current,
        liquidLevel: system.sensors.liquidLevel.current
      },
      recovery: system.recovery
    };

    res.json({
      success: true,
      data: statusSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem durumu alınırken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/system/:id/maintenance - Schedule maintenance
router.post('/:id/maintenance', auth, async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Sistem bulunamadı'
      });
    }

    const { type, description, scheduledFor } = req.body;

    // Set maintenance mode if immediate
    if (type === 'immediate') {
      system.status = 'maintenance';
      system.configuration.maintenanceMode = true;
      system.operational.isRunning = false;
    }

    // Update maintenance records
    system.maintenance.lastService = new Date();
    system.maintenance.nextService = new Date(Date.now() + (system.maintenance.serviceInterval * 24 * 60 * 60 * 1000));

    // Add maintenance alarm
    system.addAlarm('maintenance_due', description || 'Bakım zamanlandı', 'info');

    await system.save();

    res.json({
      success: true,
      message: 'Bakım başarıyla zamanlandı',
      data: {
        maintenanceScheduled: scheduledFor || 'immediate',
        description,
        nextService: system.maintenance.nextService
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bakım zamanlanırken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/system/analytics/overview - Get systems overview analytics
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const totalSystems = await System.countDocuments();
    const activeSystems = await System.countDocuments({ status: 'active' });
    const systemsInMaintenance = await System.countDocuments({ status: 'maintenance' });
    const systemsWithErrors = await System.countDocuments({ status: 'error' });

    // Calculate efficiency and recovery stats
    const efficiencyStats = await System.aggregate([
      {
        $group: {
          _id: null,
          averageEfficiency: { $avg: '$operational.efficiency' },
          totalRecovered: { $sum: '$recovery.totalRecovered' },
          averageRecoveryEfficiency: { $avg: '$recovery.efficiency' }
        }
      }
    ]);

    const stats = efficiencyStats[0] || {
      averageEfficiency: 0,
      totalRecovered: 0,
      averageRecoveryEfficiency: 0
    };

    // Count active alarms
    const systemsWithAlarms = await System.find({
      'alarms.active': true
    });

    let totalActiveAlarms = 0;
    let criticalAlarms = 0;

    systemsWithAlarms.forEach(system => {
      const activeAlarms = system.alarms.filter(alarm => alarm.active);
      totalActiveAlarms += activeAlarms.length;
      criticalAlarms += activeAlarms.filter(alarm => alarm.severity === 'critical').length;
    });

    res.json({
      success: true,
      data: {
        systems: {
          total: totalSystems,
          active: activeSystems,
          maintenance: systemsInMaintenance,
          error: systemsWithErrors
        },
        performance: {
          averageEfficiency: stats.averageEfficiency || 0,
          totalRecovered: stats.totalRecovered,
          recoveryEfficiency: stats.averageRecoveryEfficiency || 0
        },
        alarms: {
          total: totalActiveAlarms,
          critical: criticalAlarms,
          systemsAffected: systemsWithAlarms.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sistem analitikleri alınırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 