import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';

const WebSocketStatus = ({ showDetails = false }) => {
  const { isConnected, connectionStatus } = useWebSocket();

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (connectionStatus === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (isConnected) return 'Real-time Connected';
    if (connectionStatus === 'error') return 'Connection Error';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnected) return 'text-green-600';
    if (connectionStatus === 'error') return 'text-red-600';
    return 'text-gray-500';
  };

  const getBackgroundColor = () => {
    if (isConnected) return 'bg-green-50 border-green-200';
    if (connectionStatus === 'error') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getBackgroundColor()}`}>
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      
      {showDetails && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Live Updates</span>
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;
