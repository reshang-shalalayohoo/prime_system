const { getDevicesRef } = require('../config/firebase');
const DeviceModel = require('../models/device.model');
const AlertService = require('./alert.service');
const { getIO } = require('./socket.service');

/**
 * Sensor Connection Service
 * 
 * Manages ESP32 device heartbeat monitoring via Firebase Realtime Database.
 * 
 * Firebase RTDB expected structure from ESP32:
 * /devices/{device_code}/heartbeat
 *   - status: "online" | "fault"
 *   - timestamp: Unix timestamp (ms)
 *   - battery_level: 0-100
 *   - sensor_status: "ok" | "fault" | "degraded"
 *   - firmware_version: "x.x.x"
 * 
 * Workflow:
 * ESP32 → Firebase RTDB → PRIME Backend listener → MySQL update → Socket.io → Frontend
 */

// Configurable timeout (default 5 minutes)
const OFFLINE_TIMEOUT_MS = parseInt(process.env.DEVICE_OFFLINE_TIMEOUT_MS, 10) || 300000;
const CHECK_INTERVAL_MS = parseInt(process.env.DEVICE_CHECK_INTERVAL_MS, 10) || 60000;

let heartbeatInterval = null;
let firebaseListenerActive = false;

/**
 * Start listening to Firebase RTDB for device heartbeat updates.
 * When a heartbeat changes, update the corresponding device in MySQL
 * and broadcast the status change via Socket.io.
 */
function startFirebaseListener() {
  const devicesRef = getDevicesRef();
  if (!devicesRef) {
    console.warn('⚠️  Firebase listener not started — Firebase not configured');
    return;
  }

  if (firebaseListenerActive) {
    console.log('   Firebase listener already active');
    return;
  }

  // Listen for changes on each device's heartbeat
  devicesRef.on('child_changed', async (snapshot) => {
    try {
      await processHeartbeatUpdate(snapshot.key, snapshot.val());
    } catch (err) {
      console.error(`Firebase heartbeat processing error for ${snapshot.key}:`, err);
    }
  });

  // Also listen for new device entries
  devicesRef.on('child_added', async (snapshot) => {
    try {
      await processHeartbeatUpdate(snapshot.key, snapshot.val());
    } catch (err) {
      console.error(`Firebase new device processing error for ${snapshot.key}:`, err);
    }
  });

  firebaseListenerActive = true;
  console.log('✅ Firebase sensor heartbeat listener started');
}

/**
 * Process a heartbeat update from Firebase.
 * @param {string} deviceCode - The device code (e.g., "ESP32-001")
 * @param {object} data - The Firebase data for this device
 */
async function processHeartbeatUpdate(deviceCode, data) {
  if (!data || !data.heartbeat) return;

  const heartbeat = data.heartbeat;
  const device = await DeviceModel.findByDeviceCode(deviceCode);

  if (!device) {
    console.warn(`   Firebase heartbeat from unknown device: ${deviceCode}`);
    return;
  }

  // Determine status based on heartbeat data
  const now = Date.now();
  const heartbeatTimestamp = heartbeat.timestamp || now;
  const timeSinceHeartbeat = now - heartbeatTimestamp;

  let newStatus = 'online';
  if (heartbeat.sensor_status === 'fault' || heartbeat.status === 'fault') {
    newStatus = 'fault';
  } else if (timeSinceHeartbeat > OFFLINE_TIMEOUT_MS) {
    newStatus = 'offline';
  }

  const previousStatus = device.status;

  // Update MySQL
  const heartbeatDate = new Date(heartbeatTimestamp).toISOString().replace('T', ' ').substring(0, 19);
  const updatedDevice = await DeviceModel.updateHeartbeat(device.id, {
    status: newStatus,
    batteryLevel: heartbeat.battery_level,
    lastHeartbeat: heartbeatDate
  });

  // If status changed, broadcast via Socket.io and create alert if going offline/fault
  if (previousStatus !== newStatus) {
    console.log(`   📡 Device ${deviceCode}: ${previousStatus} → ${newStatus}`);

    broadcastDeviceStatus(updatedDevice);

    if (newStatus === 'offline') {
      await AlertService.createAlert({
        fieldId: device.field_id,
        userId: null,
        type: 'device_offline',
        message: `Device ${deviceCode} has gone offline. No heartbeat received within ${OFFLINE_TIMEOUT_MS / 1000} seconds.`,
        severity: 'critical'
      });
    } else if (newStatus === 'fault') {
      await AlertService.createAlert({
        fieldId: device.field_id,
        userId: null,
        type: 'device_offline',
        message: `Device ${deviceCode} is reporting a sensor/communication fault.`,
        severity: 'critical'
      });
    }
  }
}

/**
 * Periodically check all devices for heartbeat timeouts.
 * Marks devices as offline if their last heartbeat exceeds the timeout.
 */
async function checkDeviceTimeouts() {
  try {
    const devices = await DeviceModel.getAllDeviceCodes();
    const now = Date.now();

    for (const device of devices) {
      if (device.status === 'offline') continue; // Already offline

      if (device.last_heartbeat) {
        const lastHeartbeat = new Date(device.last_heartbeat).getTime();
        const timeSince = now - lastHeartbeat;

        if (timeSince > OFFLINE_TIMEOUT_MS) {
          console.log(`   ⏰ Device ${device.device_code} timed out (${Math.round(timeSince / 1000)}s since last heartbeat)`);
          
          const updatedDevice = await DeviceModel.setOffline(device.id);
          broadcastDeviceStatus(updatedDevice);

          await AlertService.createAlert({
            fieldId: updatedDevice ? updatedDevice.field_id : null,
            userId: null,
            type: 'device_offline',
            message: `Device ${device.device_code} marked offline — no heartbeat for ${Math.round(timeSince / 1000)} seconds.`,
            severity: 'critical'
          });
        }
      }
    }
  } catch (err) {
    console.error('Device timeout check error:', err);
  }
}

/**
 * Start the periodic heartbeat timeout monitor.
 */
function startHeartbeatMonitor() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(checkDeviceTimeouts, CHECK_INTERVAL_MS);
  console.log(`✅ Device heartbeat monitor started (checking every ${CHECK_INTERVAL_MS / 1000}s, timeout: ${OFFLINE_TIMEOUT_MS / 1000}s)`);
}

/**
 * Stop the heartbeat monitor and Firebase listener.
 */
function stopHeartbeatMonitor() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  const devicesRef = getDevicesRef();
  if (devicesRef) {
    devicesRef.off();
    firebaseListenerActive = false;
  }
}

/**
 * Broadcast device status update via Socket.io.
 */
function broadcastDeviceStatus(device) {
  try {
    const io = getIO();
    if (io && device) {
      io.emit('device-status-change', {
        id: device.id,
        device_code: device.device_code,
        device_name: device.device_name,
        status: device.status,
        battery_level: device.battery_level,
        last_heartbeat: device.last_heartbeat,
        last_communication: device.last_communication,
        field_id: device.field_id
      });
    }
  } catch (e) {
    console.warn('Socket.io device status broadcast failed:', e.message);
  }
}

/**
 * Get Firebase status for a specific device (for API use).
 */
async function getDeviceFirebaseStatus(deviceCode) {
  const devicesRef = getDevicesRef();
  if (!devicesRef) return null;

  try {
    const snapshot = await devicesRef.child(deviceCode).child('heartbeat').once('value');
    return snapshot.val();
  } catch (err) {
    console.error(`Failed to read Firebase status for ${deviceCode}:`, err);
    return null;
  }
}

module.exports = {
  startFirebaseListener,
  startHeartbeatMonitor,
  stopHeartbeatMonitor,
  checkDeviceTimeouts,
  getDeviceFirebaseStatus
};
