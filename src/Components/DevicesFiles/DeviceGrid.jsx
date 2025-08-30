import React from 'react';
import DeviceCard from './DeviceCard';

const DeviceGrid = ({ devices, onEdit, onDelete, getStatusBadge, getDeviceTypeBadge, user }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          onEdit={onEdit}
          onDelete={onDelete}
          getStatusBadge={getStatusBadge}
          getDeviceTypeBadge={getDeviceTypeBadge}
          user={user}
        />
      ))}
    </div>
  );
};

export default DeviceGrid;
