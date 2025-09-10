import React, { useState, useEffect } from 'react';
import { Card } from '../../Components';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useRealTimeAttendance } from '../../hooks/useRealTimeAttendance';
import { useWebSocket } from '../../contexts/WebSocketContext';

const RealTimeAttendance = () => {
  const { isConnected, connectionStatus } = useWebSocket();
  const { realTimeData, lastUpdate, hasRealTimeData } = useRealTimeAttendance();
  const [liveStats, setLiveStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0
  });
  const [recentUpdates, setRecentUpdates] = useState([]);

  // Handle real-time updates
  useEffect(() => {
    if (hasRealTimeData && realTimeData) {
      console.log('🔄 Real-time attendance update received:', realTimeData);
      
      // Update live stats
      updateLiveStats(realTimeData);
      
      // Add to recent updates
      addRecentUpdate(realTimeData);
    }
  }, [realTimeData, hasRealTimeData]);

  const updateLiveStats = (data) => {
    setLiveStats(prev => {
      const newStats = { ...prev };
      
      if (data.status === 'present') {
        newStats.presentToday += 1;
        if (data.isLate) {
          newStats.lateToday += 1;
        }
      } else if (data.status === 'absent') {
        newStats.absentToday += 1;
      } else if (data.status === 'leave') {
        newStats.onLeaveToday += 1;
      }
      
      return newStats;
    });
  };

  const addRecentUpdate = (data) => {
    const update = {
      id: Date.now(),
      employeeName: data.employee_name || 'Unknown',
      employeeId: data.employee_id || 'N/A',
      status: data.status || 'Unknown',
      timestamp: new Date(),
      device: data.device || 'Unknown',
      isLate: data.isLate || false
    };

    setRecentUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'leave':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'absent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'late':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'leave':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-time Attendance Dashboard</h2>
          <p className="text-gray-600">Live monitoring of employee attendance</p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
            isConnected 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isConnected ? 'Live Connected' : 'Disconnected'}
            </span>
          </div>
          
          {lastUpdate && (
            <div className="text-sm text-gray-500">
              Last update: {formatTime(lastUpdate)}
            </div>
          )}
        </div>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.totalEmployees}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-green-600">{liveStats.presentToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-red-600">{liveStats.absentToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late Today</p>
              <p className="text-2xl font-bold text-yellow-600">{liveStats.lateToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-blue-600">{liveStats.onLeaveToday}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Updates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Attendance Updates</h3>
          <button
            onClick={() => setRecentUpdates([])}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        
        {recentUpdates.length > 0 ? (
          <div className="space-y-3">
            {recentUpdates.map((update) => (
              <div
                key={update.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(update.status)}`}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(update.status)}
                  <div>
                    <p className="font-medium">{update.employeeName}</p>
                    <p className="text-sm text-gray-600">ID: {update.employeeId}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium capitalize">{update.status}</p>
                  <p className="text-sm text-gray-600">{formatTime(update.timestamp)}</p>
                  {update.device && (
                    <p className="text-xs text-gray-500">Device: {update.device}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No updates yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Attendance updates will appear here in real-time
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RealTimeAttendance;
