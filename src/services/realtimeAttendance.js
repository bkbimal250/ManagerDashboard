/**
 * Real-time Attendance Service
 * Handles automatic data fetching, fingerprint detection, and real-time updates
 */

import api from './api';

class RealtimeAttendanceService {
  constructor() {
    this.pollingInterval = null;
    this.lastFingerprintData = null;
    this.isPolling = false;
    this.callbacks = {
      onAttendanceUpdate: null,
      onFingerprintDetected: null,
      onError: null
    };
  }

  /**
   * Start real-time attendance monitoring
   * @param {Object} options - Configuration options
   * @param {number} options.interval - Polling interval in milliseconds (default: 5000)
   * @param {Function} options.onAttendanceUpdate - Callback for attendance updates
   * @param {Function} options.onFingerprintDetected - Callback for fingerprint detection
   * @param {Function} options.onError - Callback for errors
   */
  startPolling(options = {}) {
    if (this.isPolling) {
      console.warn('Real-time attendance polling is already active');
      return;
    }

    const {
      interval = 5000,
      onAttendanceUpdate,
      onFingerprintDetected,
      onError
    } = options;

    // Set up callbacks
    if (onAttendanceUpdate) this.callbacks.onAttendanceUpdate = onAttendanceUpdate;
    if (onFingerprintDetected) this.callbacks.onFingerprintDetected = onFingerprintDetected;
    if (onError) this.callbacks.onError = onError;

    this.isPolling = true;
    console.log(`Starting real-time attendance polling every ${interval}ms`);

    // Initial fetch
    this.fetchAttendanceData();

    // Set up polling interval
    this.pollingInterval = setInterval(() => {
      this.fetchAttendanceData();
    }, interval);
  }

  /**
   * Stop real-time attendance monitoring
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('Stopped real-time attendance polling');
  }

  /**
   * Fetch attendance data and detect changes
   */
  async fetchAttendanceData() {
    try {
      // Fetch today's attendance data from regular attendance system
      const attendanceData = await api.getTodayAttendance({ limit: 1000 });
      
      // Fetch real-time data from ZKTeco devices (now automatically synced)
      const zktecoData = await this.fetchZKTecoData();
      
      // Process fingerprint detection from both sources
      this.processFingerprintData(attendanceData, zktecoData);
      
      // Trigger attendance update callback with combined data
      if (this.callbacks.onAttendanceUpdate) {
        this.callbacks.onAttendanceUpdate({
          regular: attendanceData,
          zkteco: zktecoData,
          autoSync: true // Indicate that data is automatically synced
        });
      }

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }

  /**
   * Fetch real-time data from ZKTeco devices
   */
  async fetchZKTecoData() {
    try {
      // Get device status with timeout handling
      let deviceStatus = null;
      try {
        deviceStatus = await api.getZKTecoDeviceStatus();
      } catch (error) {
        console.warn('Failed to get ZKTeco device status:', error.message);
        // Return offline status for all devices
        deviceStatus = {
          devices: [
            { id: 1, name: 'AceTrack', ip_address: '192.168.200.150', port: 4370, is_online: false, office: 'Main Office' },
            { id: 2, name: 'Bootcamp', ip_address: '192.168.150.74', port: 4370, is_online: false, office: 'Training Center' },
            { id: 3, name: 'DOS Attendance', ip_address: '192.168.200.64', port: 4370, is_online: false, office: 'DOS Office' }
          ],
          total_devices: 3,
          online_devices: 0
        };
      }
      
      // Try to sync devices, but don't fail if it times out
      let syncResult = null;
      try {
        syncResult = await api.syncAllZKTecoDevices({
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.warn('Failed to sync ZKTeco devices:', error.message);
        syncResult = {
          message: 'Device sync failed - devices may be offline',
          total_synced: 0,
          total_errors: 3,
          device_results: {
            'AceTrack': { synced_count: 0, error_count: 1, total_logs: 0 },
            'Bootcamp': { synced_count: 0, error_count: 1, total_logs: 0 },
            'DOS Attendance': { synced_count: 0, error_count: 1, total_logs: 0 }
          }
        };
      }
      
      return {
        deviceStatus,
        syncResult,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in fetchZKTecoData:', error);
      // Return offline status as fallback
      return {
        deviceStatus: {
          devices: [
            { id: 1, name: 'AceTrack', ip_address: '192.168.200.150', port: 4370, is_online: false, office: 'Main Office' },
            { id: 2, name: 'Bootcamp', ip_address: '192.168.150.74', port: 4370, is_online: false, office: 'Training Center' },
            { id: 3, name: 'DOS Attendance', ip_address: '192.168.200.64', port: 4370, is_online: false, office: 'DOS Office' }
          ],
          total_devices: 3,
          online_devices: 0
        },
        syncResult: {
          message: 'All devices offline',
          total_synced: 0,
          total_errors: 3,
          device_results: {}
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Process fingerprint data to detect first and last finger placements
   * @param {Array} attendanceData - Current attendance data
   * @param {Object} zktecoData - ZKTeco device data
   */
  processFingerprintData(attendanceData, zktecoData) {
    if (!attendanceData || !Array.isArray(attendanceData)) return;

    const currentFingerprintData = this.extractFingerprintData(attendanceData);
    
    if (!this.lastFingerprintData) {
      // First time running, just store the data
      this.lastFingerprintData = currentFingerprintData;
      return;
    }

    // Detect changes in regular attendance data
    const changes = this.detectFingerprintChanges(
      this.lastFingerprintData, 
      currentFingerprintData
    );

    // Process ZKTeco device data for fingerprint detection
    if (zktecoData && zktecoData.syncResult) {
      const zktecoChanges = this.processZKTecoChanges(zktecoData);
      changes.push(...zktecoChanges);
    }

    if (changes.length > 0) {
      console.log('Fingerprint changes detected:', changes);
      
      // Trigger fingerprint detection callback
      if (this.callbacks.onFingerprintDetected) {
        this.callbacks.onFingerprintDetected(changes);
      }
    }

    // Update last known data
    this.lastFingerprintData = currentFingerprintData;
  }

  /**
   * Process ZKTeco device changes for fingerprint detection
   * @param {Object} zktecoData - ZKTeco device data
   * @returns {Array} Array of detected changes
   */
  processZKTecoChanges(zktecoData) {
    const changes = [];
    
    if (zktecoData.syncResult && zktecoData.syncResult.device_results) {
      Object.keys(zktecoData.syncResult.device_results).forEach(deviceName => {
        const deviceResult = zktecoData.syncResult.device_results[deviceName];
        
        if (deviceResult.synced_count > 0) {
          changes.push({
            type: 'zkteco_sync',
            deviceName: deviceName,
            syncedCount: deviceResult.synced_count,
            timestamp: new Date(),
            message: `Synced ${deviceResult.synced_count} records from ${deviceName}`,
            data: deviceResult
          });
        }
      });
    }

    // Check device status for online/offline changes
    if (zktecoData.deviceStatus && zktecoData.deviceStatus.devices) {
      zktecoData.deviceStatus.devices.forEach(device => {
        if (device.is_online) {
          changes.push({
            type: 'device_online',
            deviceName: device.name,
            deviceIp: device.ip_address,
            timestamp: new Date(),
            message: `${device.name} is online`,
            data: device
          });
        }
      });
    }

    return changes;
  }

  /**
   * Determine the type of change based on fingerprint data
   * @param {Object} change - Fingerprint change data
   * @returns {string} Change type
   */
  determineChangeType(change) {
    if (change.check_in_time && !change.check_out_time) {
      return 'check_in';
    } else if (change.check_out_time) {
      return 'check_out';
    } else {
      return 'update';
    }
  }

  /**
   * Extract fingerprint-related data from attendance records
   * @param {Array} attendanceData - Attendance data array
   * @returns {Object} Fingerprint data object
   */
  extractFingerprintData(attendanceData) {
    const fingerprintData = {};

    attendanceData.forEach(record => {
      const userId = record.user?.id || record.user_id;
      
      if (!fingerprintData[userId]) {
        fingerprintData[userId] = {
          userId,
          userName: record.user?.first_name + ' ' + record.user?.last_name,
          checkInTime: record.check_in_time,
          checkOutTime: record.check_out_time,
          lastUpdate: record.updated_at,
          device: record.device?.name || 'Unknown Device'
        };
      } else {
        // Update with latest data
        if (record.updated_at > fingerprintData[userId].lastUpdate) {
          fingerprintData[userId] = {
            ...fingerprintData[userId],
            checkInTime: record.check_in_time,
            checkOutTime: record.check_out_time,
            lastUpdate: record.updated_at
          };
        }
      }
    });

    return fingerprintData;
  }

  /**
   * Detect changes in fingerprint data
   * @param {Object} oldData - Previous fingerprint data
   * @param {Object} newData - Current fingerprint data
   * @returns {Array} Array of detected changes
   */
  detectFingerprintChanges(oldData, newData) {
    const changes = [];

    // Check for new users
    Object.keys(newData).forEach(userId => {
      if (!oldData[userId]) {
        changes.push({
          type: 'new_user',
          userId,
          userName: newData[userId].userName,
          timestamp: new Date(),
          data: newData[userId]
        });
      }
    });

    // Check for check-in/check-out changes
    Object.keys(newData).forEach(userId => {
      if (oldData[userId]) {
        const oldRecord = oldData[userId];
        const newRecord = newData[userId];

        // Check for new check-in
        if (!oldRecord.checkInTime && newRecord.checkInTime) {
          changes.push({
            type: 'check_in',
            userId,
            userName: newRecord.userName,
            timestamp: new Date(newRecord.checkInTime),
            device: newRecord.device,
            data: newRecord
          });
        }

        // Check for new check-out
        if (!oldRecord.checkOutTime && newRecord.checkOutTime) {
          changes.push({
            type: 'check_out',
            userId,
            userName: newRecord.userName,
            timestamp: new Date(newRecord.checkOutTime),
            device: newRecord.device,
            data: newRecord
          });
        }

        // Check for updated check-out (multiple finger placements)
        if (oldRecord.checkOutTime && newRecord.checkOutTime && 
            oldRecord.checkOutTime !== newRecord.checkOutTime) {
          changes.push({
            type: 'check_out_updated',
            userId,
            userName: newRecord.userName,
            timestamp: new Date(newRecord.checkOutTime),
            device: newRecord.device,
            oldCheckOut: oldRecord.checkOutTime,
            newCheckOut: newRecord.checkOutTime,
            data: newRecord
          });
        }
      }
    });

    return changes;
  }

  /**
   * Get current polling status
   * @returns {boolean} Whether polling is active
   */
  isActive() {
    return this.isPolling;
  }

  /**
   * Update polling interval
   * @param {number} interval - New interval in milliseconds
   */
  updateInterval(interval) {
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling({ interval });
    }
  }

  /**
   * Manually trigger a data fetch
   */
  async refresh() {
    await this.fetchAttendanceData();
  }
}

// Create singleton instance
const realtimeAttendanceService = new RealtimeAttendanceService();

export default realtimeAttendanceService;
