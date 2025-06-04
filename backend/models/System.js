const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: true,
    unique: true,
    default: () => `SYS_${Date.now()}`
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error', 'calibrating'],
    default: 'inactive'
  },
  operational: {
    isRunning: { type: Boolean, default: false },
    startTime: Date,
    uptime: { type: Number, default: 0 }, // in seconds
    cycleCount: { type: Number, default: 0 },
    lastCycle: Date,
    efficiency: { type: Number, min: 0, max: 100, default: 0 }
  },
  sensors: {
    flowRate: {
      current: { type: Number, default: 0 },
      unit: { type: String, default: 'L/min' },
      min: Number,
      max: Number,
      lastReading: { type: Date, default: Date.now }
    },
    pressure: {
      current: { type: Number, default: 0 },
      unit: { type: String, default: 'bar' },
      min: Number,
      max: Number,
      lastReading: { type: Date, default: Date.now }
    },
    temperature: {
      current: { type: Number, default: 20 },
      unit: { type: String, default: '°C' },
      min: Number,
      max: Number,
      lastReading: { type: Date, default: Date.now }
    },
    ph: {
      current: { type: Number, default: 7 },
      min: { type: Number, default: 6 },
      max: { type: Number, default: 8 },
      lastReading: { type: Date, default: Date.now }
    },
    turbidity: {
      current: { type: Number, default: 0 },
      unit: { type: String, default: 'NTU' },
      threshold: { type: Number, default: 10 },
      lastReading: { type: Date, default: Date.now }
    },
    liquidLevel: {
      current: { type: Number, default: 0 },
      unit: { type: String, default: '%' },
      min: { type: Number, default: 10 },
      max: { type: Number, default: 95 },
      lastReading: { type: Date, default: Date.now }
    }
  },
  filtration: {
    status: {
      type: String,
      enum: ['clean', 'normal', 'dirty', 'blocked', 'maintenance'],
      default: 'clean'
    },
    efficiency: { type: Number, min: 0, max: 100, default: 95 },
    lastCleaned: Date,
    cyclesSinceCleaning: { type: Number, default: 0 },
    backwashNeeded: { type: Boolean, default: false }
  },
  recovery: {
    totalRecovered: { type: Number, default: 0 },
    todayRecovered: { type: Number, default: 0 },
    efficiency: { type: Number, min: 0, max: 100, default: 0 },
    wasteReduction: { type: Number, min: 0, max: 100, default: 0 }
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    serviceInterval: { type: Number, default: 30 }, // days
    totalServiceHours: { type: Number, default: 0 },
    components: [{
      name: String,
      lastReplaced: Date,
      nextReplacement: Date,
      status: {
        type: String,
        enum: ['good', 'wear', 'replace_soon', 'replace_now'],
        default: 'good'
      }
    }]
  },
  alarms: [{
    type: {
      type: String,
      enum: ['system_error', 'sensor_fault', 'low_level', 'high_pressure', 'filter_blocked', 'maintenance_due']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info'
    },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    acknowledgedAt: Date,
    resolvedAt: Date
  }],
  performance: {
    dailyStats: [{
      date: { type: Date, default: Date.now },
      volumeProcessed: Number,
      recoveryRate: Number,
      efficiency: Number,
      uptime: Number,
      energyConsumption: Number
    }],
    monthlyAverage: {
      efficiency: Number,
      uptime: Number,
      recoveryRate: Number,
      energySaved: Number
    }
  },
  configuration: {
    autoMode: { type: Boolean, default: true },
    recoveryTarget: { type: Number, default: 90 },
    maintenanceMode: { type: Boolean, default: false },
    alertThresholds: {
      lowLevel: { type: Number, default: 15 },
      highPressure: { type: Number, default: 8 },
      highTemperature: { type: Number, default: 40 },
      lowEfficiency: { type: Number, default: 80 }
    }
  },
  location: {
    facility: String,
    building: String,
    room: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt
systemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for system health
systemSchema.virtual('health').get(function() {
  const activeAlarms = this.alarms.filter(alarm => alarm.active);
  const criticalAlarms = activeAlarms.filter(alarm => alarm.severity === 'critical');
  
  if (criticalAlarms.length > 0) return 'critical';
  if (activeAlarms.length > 3) return 'poor';
  if (activeAlarms.length > 0) return 'warning';
  return 'good';
});

// Method to calculate uptime percentage
systemSchema.methods.calculateUptime = function() {
  if (!this.operational.startTime) return 0;
  const totalTime = Date.now() - this.operational.startTime;
  return ((this.operational.uptime / totalTime) * 100).toFixed(2);
};

// Method to check if maintenance is due
systemSchema.methods.isMaintenanceDue = function() {
  if (!this.maintenance.lastService) return true;
  const daysSince = (Date.now() - this.maintenance.lastService) / (1000 * 60 * 60 * 24);
  return daysSince >= this.maintenance.serviceInterval;
};

// Method to add alarm
systemSchema.methods.addAlarm = function(type, message, severity = 'info') {
  this.alarms.push({
    type,
    message,
    severity,
    active: true
  });
  return this.save();
};

// Method to acknowledge alarm
systemSchema.methods.acknowledgeAlarm = function(alarmId) {
  const alarm = this.alarms.id(alarmId);
  if (alarm) {
    alarm.acknowledgedAt = Date.now();
    return this.save();
  }
  return Promise.reject(new Error('Alarm not found'));
};

// Static method to get systems needing maintenance
systemSchema.statics.getMaintenanceDue = function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.find({
    $or: [
      { 'maintenance.lastService': { $lt: thirtyDaysAgo } },
      { 'maintenance.lastService': { $exists: false } }
    ]
  });
};

module.exports = mongoose.model('System', systemSchema); 