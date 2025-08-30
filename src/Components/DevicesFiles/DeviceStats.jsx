import React from 'react';
import { Card } from '../../Components';
import { Monitor, Wifi, WifiOff, Settings, Activity } from 'lucide-react';

const DeviceStats = ({ devices }) => {
  const calculateStats = () => {
    const total = devices.length;
    const active = devices.filter(d => d.is_active).length;
    const inactive = total - active;
    const online = devices.filter(d => d.device_status === 'online').length;
    const offline = devices.filter(d => d.device_status === 'offline').length;
    const error = devices.filter(d => d.device_status === 'error').length;
    
    const esslCount = devices.filter(d => d.device_type === 'essl').length;
    const zktecoCount = devices.filter(d => d.device_type === 'zkteco').length;
    const otherCount = total - esslCount - zktecoCount;

    return {
      total,
      active,
      inactive,
      online,
      offline,
      error,
      esslCount,
      zktecoCount,
      otherCount
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Monitor className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Devices</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Wifi className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Devices</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Online</p>
            <p className="text-2xl font-bold text-gray-900">{stats.online}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <WifiOff className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Offline</p>
            <p className="text-2xl font-bold text-gray-900">{stats.offline}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeviceStats;
