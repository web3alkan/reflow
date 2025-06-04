const mqtt = require('mqtt');
const logger = require('../utils/logger');

let mqttClient = null;

// MQTT connection options
const options = {
  host: process.env.MQTT_HOST || 'localhost',
  port: process.env.MQTT_PORT || 1883,
  protocol: 'mqtt',
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',
  clientId: `reflow_backend_${Math.random().toString(16).substr(2, 8)}`,
  clean: true,
  connectTimeout: 30000,
  reconnectPeriod: 5000,
  keepalive: 60
};

// Topics for different sensors and systems
const TOPICS = {
  SENSOR_DATA: 'reflow/sensors/+/data',
  SYSTEM_STATUS: 'reflow/system/+/status',
  AI_COMMANDS: 'reflow/ai/commands',
  LIQUID_LEVELS: 'reflow/liquid/+/level',
  FILTRATION_STATUS: 'reflow/filtration/+/status',
  UV_CAMERA: 'reflow/uv/camera/+',
  PUMP_CONTROL: 'reflow/pumps/+/control',
  ALERTS: 'reflow/alerts/+'
};

const connectMQTT = (io) => {
  try {
    mqttClient = mqtt.connect(options);

    mqttClient.on('connect', () => {
      logger.info('MQTT client connected successfully');
      
      // Subscribe to all relevant topics
      Object.values(TOPICS).forEach(topic => {
        mqttClient.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            logger.error(`Failed to subscribe to topic ${topic}: ${err.message}`);
          } else {
            logger.info(`Subscribed to topic: ${topic}`);
          }
        });
      });
    });

    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        logger.debug(`Received MQTT message on topic ${topic}:`, data);

        // Handle different message types
        if (topic.includes('/sensors/')) {
          await handleSensorData(topic, data, io);
        } else if (topic.includes('/system/')) {
          await handleSystemStatus(topic, data, io);
        } else if (topic.includes('/liquid/')) {
          await handleLiquidData(topic, data, io);
        } else if (topic.includes('/uv/camera/')) {
          await handleUVCameraData(topic, data, io);
        } else if (topic.includes('/alerts/')) {
          await handleAlerts(topic, data, io);
        }

      } catch (error) {
        logger.error(`Error processing MQTT message from ${topic}: ${error.message}`);
      }
    });

    mqttClient.on('error', (error) => {
      logger.error(`MQTT connection error: ${error.message}`);
    });

    mqttClient.on('offline', () => {
      logger.warn('MQTT client is offline');
    });

    mqttClient.on('reconnect', () => {
      logger.info('MQTT client attempting to reconnect');
    });

  } catch (error) {
    logger.error(`Failed to initialize MQTT client: ${error.message}`);
  }
};

const handleSensorData = async (topic, data, io) => {
  // Extract sensor ID from topic (reflow/sensors/SENSOR_ID/data)
  const sensorId = topic.split('/')[2];
  
  // Emit real-time sensor data to connected clients
  io.emit('sensorData', {
    sensorId,
    timestamp: new Date(),
    ...data
  });

  // Check for threshold violations
  if (data.value !== undefined) {
    const thresholds = {
      temperature: { min: 15, max: 45 },
      pressure: { min: 1, max: 8 },
      ph: { min: 6, max: 8 },
      flow_rate: { min: 0.5, max: 10 },
      liquid_level: { min: 10, max: 95 }
    };

    const threshold = thresholds[data.type];
    if (threshold && (data.value < threshold.min || data.value > threshold.max)) {
      const alert = {
        type: 'threshold_violation',
        sensorId,
        sensorType: data.type,
        value: data.value,
        threshold,
        severity: 'warning',
        timestamp: new Date()
      };

      // Emit alert
      io.emit('systemAlert', alert);
      logger.warn(`Threshold violation detected for sensor ${sensorId}: ${data.type} = ${data.value}`);
    }
  }
};

const handleSystemStatus = async (topic, data, io) => {
  const systemId = topic.split('/')[2];
  
  // Emit system status update
  io.emit('systemStatusUpdate', {
    systemId,
    timestamp: new Date(),
    ...data
  });

  logger.info(`System ${systemId} status update: ${data.status}`);
};

const handleLiquidData = async (topic, data, io) => {
  const liquidId = topic.split('/')[2];
  
  // Emit liquid level update
  io.emit('liquidLevelUpdate', {
    liquidId,
    timestamp: new Date(),
    ...data
  });

  // Check for low liquid levels
  if (data.level < 10) {
    const alert = {
      type: 'low_liquid_level',
      liquidId,
      level: data.level,
      severity: 'high',
      timestamp: new Date()
    };

    io.emit('systemAlert', alert);
    logger.warn(`Low liquid level detected for tank ${liquidId}: ${data.level}%`);
  }
};

const handleUVCameraData = async (topic, data, io) => {
  const cameraId = topic.split('/')[3];
  
  // Emit UV camera data for AI processing
  io.emit('uvCameraData', {
    cameraId,
    timestamp: new Date(),
    ...data
  });

  // If image data is received, trigger AI analysis
  if (data.imageData || data.imagePath) {
    logger.info(`UV image received from camera ${cameraId}, triggering AI analysis`);
    
    // Emit trigger for AI processing
    io.emit('aiAnalysisTrigger', {
      cameraId,
      imageData: data.imageData,
      imagePath: data.imagePath,
      timestamp: new Date()
    });
  }
};

const handleAlerts = async (topic, data, io) => {
  const alertType = topic.split('/')[2];
  
  // Emit alert to all connected clients
  io.emit('systemAlert', {
    alertType,
    timestamp: new Date(),
    ...data
  });

  logger.warn(`Alert received: ${alertType} - ${data.message}`);
};

// Publish message to MQTT topic
const publishMessage = (topic, message) => {
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
      if (error) {
        logger.error(`Failed to publish message to ${topic}: ${error.message}`);
      } else {
        logger.debug(`Message published to ${topic}`);
      }
    });
  } else {
    logger.error('MQTT client not connected, cannot publish message');
  }
};

// Control system components via MQTT
const controlSystem = (systemId, command) => {
  const topic = `reflow/system/${systemId}/commands`;
  publishMessage(topic, {
    command,
    timestamp: new Date(),
    source: 'backend_api'
  });
};

// Control pumps
const controlPump = (pumpId, action, parameters = {}) => {
  const topic = `reflow/pumps/${pumpId}/control`;
  publishMessage(topic, {
    action, // start, stop, speed
    parameters,
    timestamp: new Date()
  });
};

// Trigger UV light for inspection
const triggerUVInspection = (cameraId, inspectionParams) => {
  const topic = `reflow/uv/camera/${cameraId}/commands`;
  publishMessage(topic, {
    command: 'start_inspection',
    parameters: inspectionParams,
    timestamp: new Date()
  });
};

// Send AI analysis results
const sendAIResults = (analysisId, results) => {
  const topic = 'reflow/ai/results';
  publishMessage(topic, {
    analysisId,
    results,
    timestamp: new Date()
  });
};

const disconnectMQTT = () => {
  if (mqttClient) {
    mqttClient.end();
    logger.info('MQTT client disconnected');
  }
};

module.exports = {
  connectMQTT,
  publishMessage,
  controlSystem,
  controlPump,
  triggerUVInspection,
  sendAIResults,
  disconnectMQTT,
  TOPICS
}; 