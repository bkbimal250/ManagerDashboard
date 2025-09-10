import { useEffect, useCallback, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

export const useRealTimeAttendance = (employeeId = null) => {
  const {
    isConnected,
    subscribeToAttendanceUpdates,
    subscribeToGeneralAttendanceUpdates,
    unsubscribeFromAttendanceUpdates,
    unsubscribeFromGeneralAttendanceUpdates,
  } = useWebSocket();

  const [realTimeData, setRealTimeData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Handle attendance updates
  const handleAttendanceUpdate = useCallback((data) => {
    console.log('🔄 Real-time attendance update received:', data);
    setRealTimeData(data);
    setLastUpdate(new Date());
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isConnected) {
      console.log('🔌 WebSocket not connected, skipping subscription');
      return;
    }

    if (employeeId) {
      // Subscribe to specific employee updates
      console.log(`🔌 Subscribing to attendance updates for employee ${employeeId}`);
      subscribeToAttendanceUpdates(employeeId, handleAttendanceUpdate);
    } else {
      // Subscribe to general attendance updates
      console.log('🔌 Subscribing to general attendance updates');
      subscribeToGeneralAttendanceUpdates(handleAttendanceUpdate);
    }

    // Cleanup subscription on unmount
    return () => {
      if (employeeId) {
        console.log(`🔌 Unsubscribing from attendance updates for employee ${employeeId}`);
        unsubscribeFromAttendanceUpdates(employeeId);
      } else {
        console.log('🔌 Unsubscribing from general attendance updates');
        unsubscribeFromGeneralAttendanceUpdates();
      }
    };
  }, [isConnected, employeeId, subscribeToAttendanceUpdates, subscribeToGeneralAttendanceUpdates, unsubscribeFromAttendanceUpdates, unsubscribeFromGeneralAttendanceUpdates, handleAttendanceUpdate]);

  // Get connection status
  const getConnectionStatus = () => {
    if (isConnected) return '🟢 Connected';
    return '🔴 Disconnected';
  };

  // Check if we have real-time data
  const hasRealTimeData = realTimeData !== null;

  // Get formatted last update time
  const getFormattedLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    return lastUpdate.toLocaleTimeString();
  };

  return {
    realTimeData,
    lastUpdate,
    hasRealTimeData,
    isConnected,
    getConnectionStatus,
    getFormattedLastUpdate,
    // Force refresh function
    refresh: () => {
      setRealTimeData(null);
      setLastUpdate(null);
    }
  };
};
