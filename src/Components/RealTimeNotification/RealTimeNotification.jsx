import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useRealTimeAttendance } from '../../hooks/useRealTimeAttendance';

const RealTimeNotification = ({ employeeId = null, autoHide = true, hideDelay = 5000 }) => {
  const { realTimeData, lastUpdate, hasRealTimeData, isConnected } = useRealTimeAttendance(employeeId);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationType, setNotificationType] = useState('info');

  useEffect(() => {
    if (hasRealTimeData && realTimeData) {
      setIsVisible(true);
      
      // Determine notification type based on data
      if (realTimeData.status === 'present') {
        setNotificationType('success');
      } else if (realTimeData.status === 'absent') {
        setNotificationType('warning');
      } else {
        setNotificationType('info');
      }

      // Auto-hide notification after delay
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, hideDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [realTimeData, hasRealTimeData, autoHide, hideDelay]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !hasRealTimeData) {
    return null;
  }

  const getNotificationIcon = () => {
    switch (notificationType) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = () => {
    switch (notificationType) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getNotificationTextColor = () => {
    switch (notificationType) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg shadow-lg ${getNotificationColor()}`}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          {getNotificationIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <div className={`text-sm font-medium ${getNotificationTextColor()}`}>
            Real-time Attendance Update
          </div>
          
          {realTimeData && (
            <div className="mt-1 text-sm text-gray-600">
              {employeeId ? (
                <div>
                  <p><strong>Employee ID:</strong> {realTimeData.employee_id || employeeId}</p>
                  <p><strong>Status:</strong> {realTimeData.status || 'Unknown'}</p>
                  <p><strong>Time:</strong> {realTimeData.timestamp || 'Now'}</p>
                  {realTimeData.device && <p><strong>Device:</strong> {realTimeData.device}</p>}
                </div>
              ) : (
                <div>
                  <p><strong>New attendance record:</strong></p>
                  <p>{realTimeData.employee_name || 'Employee'}: {realTimeData.status || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">
                    {lastUpdate ? `Updated at ${lastUpdate.toLocaleTimeString()}` : 'Just now'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeNotification;
