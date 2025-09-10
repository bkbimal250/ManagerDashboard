// Native WebSocket implementation for Django Channels

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.subscribers = new Map();
    this.connectionStatus = 'disconnected';
  }

  connect(token = null) {
    try {
      // Use native WebSocket instead of Socket.IO for Django Channels
      // Use the same base URL as the API service
      const baseUrl = 'https://company.d0s369.co.in';
      const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws/attendance/';
      this.socket = new WebSocket(wsUrl);
      
      this.setupEventListeners();
      this.connectionStatus = 'connecting';
      
    } catch (error) {
      this.connectionStatus = 'error';
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.isConnected = true;
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      
      // Send authentication if token is provided
      if (this.token) {
        this.sendMessage({
          type: 'authenticate',
          token: this.token
        });
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        // console.error('WebSocket: Error parsing message:', error);
      }
    };

    this.socket.onclose = (event) => {
      // console.log('WebSocket: Connection closed:', event.code, event.reason);
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      
      // Attempt to reconnect if not manually closed
      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      // console.error('WebSocket: Connection error:', error);
      this.connectionStatus = 'error';
    };
  }

  handleMessage(data) {
    const { type, ...messageData } = data;
    
    switch (type) {
      case 'connection_established':
        // console.log('WebSocket: Connection confirmed');
        break;
        
      case 'attendance_update':
        // Broadcast to all subscribers
        this.subscribers.forEach((callback) => {
          if (callback.type === 'attendance' || callback.type === 'general') {
            callback.fn(messageData);
          }
        });
        break;
        
      case 'latest_attendance':
        // Send to general attendance subscribers
        this.subscribers.forEach((callback) => {
          if (callback.type === 'general') {
            callback.fn(messageData);
          }
        });
        break;
        
      case 'pong':
        // Handle ping-pong for connection health
        break;
        
      default:
        // console.log('WebSocket: Unknown message type:', type, messageData);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // console.log('WebSocket: Max reconnection attempts reached');
      this.connectionStatus = 'failed';
      return;
    }

    this.reconnectAttempts++;
    // console.log(`WebSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  subscribeToAttendanceUpdates(employeeId, callback) {
    const key = `attendance_${employeeId}`;
    this.subscribers.set(key, { type: 'attendance', fn: callback });
    
    // Request latest data for this employee
    this.requestAttendanceData(employeeId);
    
    return () => this.unsubscribeFromAttendanceUpdates(employeeId);
  }

  subscribeToGeneralAttendanceUpdates(callback) {
    const key = 'general_attendance';
    this.subscribers.set(key, { type: 'general', fn: callback });
    
    // Request latest general data
    this.requestLatestAttendance();
    
    return () => this.unsubscribeFromGeneralAttendanceUpdates();
  }

  unsubscribeFromAttendanceUpdates(employeeId) {
    const key = `attendance_${employeeId}`;
    this.subscribers.delete(key);
  }

  unsubscribeFromGeneralAttendanceUpdates() {
    const key = 'general_attendance';
    this.subscribers.delete(key);
  }

  sendMessage(data) {
    if (this.isConnected && this.socket) {
      try {
        this.socket.send(JSON.stringify(data));
      } catch (error) {
        // console.error('WebSocket: Error sending message:', error);
      }
    } else {
      // console.warn('WebSocket: Cannot send message - not connected');
    }
  }

  sendAttendanceData(data) {
    this.sendMessage({
      type: 'attendance_data',
      data: data
    });
  }

  requestAttendanceData(employeeId, date = null) {
    this.sendMessage({
      type: 'get_attendance',
      employee_id: employeeId,
      date: date
    });
  }

  requestLatestAttendance() {
    this.sendMessage({
      type: 'get_latest'
    });
  }

  ping() {
    this.sendMessage({
      type: 'ping',
      timestamp: Date.now()
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.subscribers.clear();
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

const websocketService = new WebSocketService();
export default websocketService;
