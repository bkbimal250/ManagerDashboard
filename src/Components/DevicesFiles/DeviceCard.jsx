import React from 'react';
import { Card, Button } from '../../Components';
import { 
  Monitor, 
  Edit, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Settings, 
  Activity,
  Clock,
  MapPin,
  Building
} from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';

const DeviceCard = ({ device, onEdit, onDelete, getStatusBadge, getDeviceTypeBadge, user }) => {
  const getStatusIcon = (isActive) => {
    return isActive ? (
      <Wifi className="h-4 w-4 text-green-600" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-600" />
    );
  };

  const getDeviceStatusIcon = (status) => {
    const statusIcons = {
      online: <Wifi className="h-4 w-4 text-green-600" />,
      offline: <WifiOff className="h-4 w-4 text-red-600" />,
      error: <Settings className="h-4 w-4 text-yellow-600" />
    };
    return statusIcons[status] || <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Monitor className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {device.name}
            </h3>
            <p className="text-sm text-gray-500">{device.ip_address}:{device.port}</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(device)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit Device"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(device.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete Device"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Type:</span>
          {getDeviceTypeBadge(device.device_type)}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          {getStatusBadge(device.is_active)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Device Status:</span>
          <div className="flex items-center space-x-1">
            {getDeviceStatusIcon(device.device_status)}
            <span className={`text-xs font-medium ${
              device.device_status === 'online' ? 'text-green-600' :
              device.device_status === 'offline' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {device.device_status}
            </span>
          </div>
        </div>

        {device.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {device.location}
          </div>
        )}

        {device.office && (
          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-2 text-gray-400" />
            {device.office_name}
          </div>
        )}

        {device.last_sync && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            Last Sync: {formatDateWithDay(device.last_sync)}
          </div>
        )}

        {device.firmware_version && (
          <div className="flex items-center text-sm text-gray-600">
            <Settings className="h-4 w-4 mr-2 text-gray-400" />
            Firmware: {device.firmware_version}
          </div>
        )}

        {device.serial_number && (
          <div className="text-xs text-gray-500">
            S/N: {device.serial_number}
          </div>
        )}
      </div>

      {device.description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{device.description}</p>
        </div>
      )}
    </Card>
  );
};

export default DeviceCard;
