import React, { createContext, useContext, useEffect, useState } from 'react';
import websocketService from '../services/websocket';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    const initWebSocket = () => {
      try {
        // Get token from localStorage if available
        const token = localStorage.getItem('access_token');
        
        websocketService.connect(token);
        
        // Set up status monitoring
        const checkConnection = () => {
          const status = websocketService.getConnectionStatus();
          setIsConnected(status);
          setConnectionStatus(status ? 'connected' : 'disconnected');
        };

        // Check connection status periodically
        const interval = setInterval(checkConnection, 1000);
        
        // Initial check
        checkConnection();

        return () => {
          clearInterval(interval);
          websocketService.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    initWebSocket();
  }, []);

  const connect = (token = null) => {
    websocketService.connect(token);
  };

  const disconnect = () => {
    websocketService.disconnect();
  };

  const subscribeToAttendanceUpdates = (employeeId, callback) => {
    return websocketService.subscribeToAttendanceUpdates(employeeId, callback);
  };

  const subscribeToGeneralAttendanceUpdates = (callback) => {
    return websocketService.subscribeToGeneralAttendanceUpdates(callback);
  };

  const unsubscribeFromAttendanceUpdates = (employeeId) => {
    websocketService.unsubscribeFromAttendanceUpdates(employeeId);
  };

  const unsubscribeFromGeneralAttendanceUpdates = () => {
    websocketService.unsubscribeFromGeneralAttendanceUpdates();
  };

  const sendAttendanceData = (data) => {
    websocketService.sendAttendanceData(data);
  };

  const requestAttendanceData = (employeeId, date) => {
    websocketService.requestAttendanceData(employeeId, date);
  };

  const value = {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    subscribeToAttendanceUpdates,
    subscribeToGeneralAttendanceUpdates,
    unsubscribeFromAttendanceUpdates,
    unsubscribeFromGeneralAttendanceUpdates,
    sendAttendanceData,
    requestAttendanceData,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
