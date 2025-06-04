const mongoose = require('mongoose');

const liquidSchema = new mongoose.Schema({
  liquidId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['penetrant', 'cleaner', 'developer'],
    default: 'penetrant'
  },
  brand: {
    type: String,
    required: true
  },
  quantity: {
    current: { type: Number, required: true, min: 0 },
    original: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'liters' }
  },
  contamination: {
    level: { type: Number, min: 0, max: 100, default: 0 },
    particles: { type: Number, default: 0 },
    lastTested: { type: Date, default: Date.now }
  },
  properties: {
    viscosity: Number,
    temperature: Number,
    ph: Number,
    density: Number
  },
  recycling: {
    cycles: { type: Number, default: 0 },
    efficiency: { type: Number, min: 0, max: 100 },
    lastRecycled: Date,
    totalRecovered: { type: Number, default: 0 }
  },
  quality: {
    status: {
      type: String,
      enum: ['excellent', 'good', 'acceptable', 'poor', 'unusable'],
      default: 'good'
    },
    lastInspection: { type: Date, default: Date.now },
    nextInspection: Date
  },
  location: {
    tank: String,
    section: String,
    position: String
  },
  environmental: {
    carbonFootprint: Number,
    biodegradable: { type: Boolean, default: false },
    ecoRating: { type: Number, min: 1, max: 5, default: 3 }
  },
  usage: {
    totalUsed: { type: Number, default: 0 },
    averageDaily: Number,
    peakUsage: Number,
    lastUsed: Date
  },
  alerts: [{
    type: {
      type: String,
      enum: ['low_quantity', 'high_contamination', 'quality_degraded', 'maintenance_due']
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    createdAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt on save
liquidSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for contamination status
liquidSchema.virtual('contaminationStatus').get(function() {
  if (this.contamination.level < 10) return 'clean';
  if (this.contamination.level < 30) return 'light';
  if (this.contamination.level < 60) return 'moderate';
  if (this.contamination.level < 80) return 'heavy';
  return 'critical';
});

// Method to calculate recovery efficiency
liquidSchema.methods.calculateRecoveryEfficiency = function() {
  if (this.quantity.original === 0) return 0;
  return ((this.recycling.totalRecovered / this.quantity.original) * 100).toFixed(2);
};

// Method to determine if maintenance is needed
liquidSchema.methods.needsMaintenance = function() {
  return this.contamination.level > 70 || this.quality.status === 'poor' || this.quality.status === 'unusable';
};

// Static method to get low stock liquids
liquidSchema.statics.getLowStock = function(threshold = 10) {
  return this.find({
    'quantity.current': { $lt: threshold }
  });
};

module.exports = mongoose.model('Liquid', liquidSchema); 